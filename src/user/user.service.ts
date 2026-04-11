import { Injectable } from "@nestjs/common";
import { hash } from "bcrypt";

import { RegisterDto } from "src/auth/dto/register.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getById(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async getByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async create(dto: RegisterDto) {
    return await this.prismaService.user.create({
      data: {
        ...dto,
        password: await hash(dto.password, 7),
      },
    });
  }
}
