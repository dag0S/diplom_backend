import { Injectable } from "@nestjs/common";
import { hash } from "argon2";

import { RegisterDto } from "src/auth/dto/register.dto";
import { PrismaService } from "src/prisma/prisma.service";
import type { GetByIdOptions } from "./interfaces/get-by-id-options.interface";
import { Role } from "src/generated/prisma/enums";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllDoctors() {
    return await this.prismaService.user.findMany({
      where: {
        role: Role.DOCTOR,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        role: true,
      },
    });
  }

  async getById(id: string, options?: GetByIdOptions) {
    return await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        role: true,
        isEmailVerified: true,
        isTwoFactorEnabled: true,
        twoFactor: options?.twoFactor
          ? {
              select: {
                id: true,
                secret: true,
              },
            }
          : false,
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
