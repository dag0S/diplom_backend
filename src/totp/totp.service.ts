import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateSecret, generateURI, verify } from "otplib";

import { CryptoService } from "src/crypto/crypto.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TotpService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  async generateSecret(userId: string) {
    const existedTwoFactor = await this.prismaService.twoFactor.findUnique({
      where: {
        userId,
      },
    });

    if (existedTwoFactor) {
      throw new BadRequestException("Двухфакторная аутентификация включена");
    }

    const secret = generateSecret();
    const encryptedSecret = this.cryptoService.encrypt(secret);

    await this.prismaService.twoFactor.create({
      data: {
        secret: encryptedSecret,
        userId,
      },
    });

    const option = {
      issuer: "Diplom",
      label: this.configService.getOrThrow<string>("EMAIL_USER"),
      secret,
    };

    const otpauthUrl = generateURI(option);

    return {
      ...option,
      otpauthUrl,
    };
  }

  async validateTotp(userId: string, token: string): Promise<boolean> {
    const twoFactor = await this.prismaService.twoFactor.findUnique({
      where: {
        userId,
      },
    });

    if (!twoFactor) {
      throw new NotFoundException("Двухфакторная аутентификация не включена");
    }

    const secret = twoFactor.secret;
    const decryptedSecret = this.cryptoService.decrypt(secret);

    const res = await verify({ secret: decryptedSecret, token });

    if (!res.valid) {
      throw new BadRequestException("Некорректный код");
    }

    return true;
  }

  async deleteSecret(userId: string) {
    const existedTwoFactor = await this.prismaService.twoFactor.findUnique({
      where: {
        userId,
      },
    });

    if (!existedTwoFactor) return;

    await this.prismaService.twoFactor.delete({
      where: {
        userId,
      },
    });
  }
}
