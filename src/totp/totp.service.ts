import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generate, generateSecret, generateURI, verify } from "otplib";

import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TotpService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async generateSecret(userId: string): Promise<string> {
    const secret = generateSecret();

    const existedTwoFactor = await this.prismaService.twoFactor.findUnique({
      where: {
        userId,
      },
    });

    if (existedTwoFactor) {
      throw new BadRequestException("Двухфакторная аутентификация включена");
    }

    await this.prismaService.twoFactor.create({
      data: {
        secret,
        userId,
      },
    });

    const qr = generateURI({
      issuer: "Diplom",
      label: this.configService.getOrThrow<string>("EMAIL_USER"),
      secret,
    });

    return qr;
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

    const res = await verify({ secret, token });

    if (!res.valid) {
      throw new BadRequestException("Некорректный код");
    }

    return true;
  }

  async deleteSecret(userId: string) {
    await this.prismaService.twoFactor.delete({
      where: {
        userId,
      },
    });
  }
}
