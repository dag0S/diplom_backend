import { Injectable } from "@nestjs/common";
import { hash } from "argon2";

import { RegisterDto } from "src/auth/dto/register.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getById(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
    });
  }

  async getByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async create(dto: RegisterDto) {
    const { email, firstName, lastName, middleName, role, password } = dto;

    return await this.prismaService.user.create({
      data: {
        email,
        firstName,
        lastName,
        middleName,
        role,
        password: await hash(password),
      },
    });
  }

  async verifyEmail(userId: string) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
      },
    });
  }

  async setIsTwoFactorEnabled(userId: string, isTwoFactorEnabled: boolean) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled,
      },
    });
  }
}
