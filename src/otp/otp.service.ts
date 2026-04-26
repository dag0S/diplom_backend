import { BadRequestException, Injectable } from "@nestjs/common";
import { hash, verify } from "argon2";
import { generate, generateSecret } from "otplib";

import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OtpService {
  constructor(private readonly prismaService: PrismaService) {}

  async generateOTP(userId: string): Promise<string> {
    const secret = generateSecret();
    const otp = await generate({ secret });
    const hashedOTP = await hash(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prismaService.otp.create({
      data: {
        code: hashedOTP,
        expiresAt,
        userId,
      },
    });

    return otp;
  }

  async validateOtp(userId: string, token: string): Promise<boolean> {
    const validToken = await this.prismaService.otp.findFirst({
      where: {
        userId,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!validToken) {
      throw new BadRequestException("Срок действия кода истёк");
    }

    const isMatch = await verify(validToken.code, token);

    if (!isMatch) {
      throw new BadRequestException("Некорректный код");
    }

    await this.prismaService.otp.update({
      where: {
        id: validToken.id,
      },
      data: {
        isUsed: true,
      },
    });

    return true;
  }
}
