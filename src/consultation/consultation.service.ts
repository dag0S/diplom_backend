import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";
import { CreateConsultationDto } from "./dto/create-consultation.dto";
import { RecommendationsDto } from "./dto/recommendations.dto";
import { CommentsDto } from "./dto/comments.dto";
import { CryptoService } from "src/crypto/crypto.service";
import { Role } from "src/generated/prisma/enums";

@Injectable()
export class ConsultationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async getById(id: string, userId: string, role: Role) {
    let query: { doctorId?: string; patientId?: string };

    if (role === Role.DOCTOR) {
      query = {
        doctorId: userId,
      };
    } else {
      query = {
        patientId: userId,
      };
    }

    const consultation = await this.prismaService.consultation.findUnique({
      where: { id, ...query },
      select: {
        id: true,
        comments: true,
        recommendations: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException("Консультация не найдена");
    }

    const decryptedCommentsAndRecommendations = this.decrypt(
      consultation?.recommendations,
      consultation?.comments,
    );

    return {
      ...consultation,
      ...decryptedCommentsAndRecommendations,
    };
  }

  async getAll(id: string, role: Role) {
    let query: { doctorId?: string; patientId?: string };

    if (role === Role.DOCTOR) {
      query = {
        doctorId: id,
      };
    } else {
      query = {
        patientId: id,
      };
    }

    return await this.prismaService.consultation.findMany({
      where: query,
      select: {
        id: true,
        comments: true,
        recommendations: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(dto: CreateConsultationDto) {
    const { doctorId, patientId } = dto;

    const doctor = await this.prismaService.user.findUnique({
      where: { id: doctorId },
    });

    const patient = await this.prismaService.user.findUnique({
      where: { id: patientId },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      throw new NotFoundException("Доктор не найден");
    }

    if (!patient || patient.role !== "PATIENT") {
      throw new NotFoundException("Пациент не найден");
    }

    await this.prismaService.consultation.create({
      data: {
        doctorId: dto.doctorId,
        patientId: dto.patientId,
      },
    });

    return { message: "Вы записаны на примём" };
  }

  async updateRecommendations(
    id: string,
    dto: RecommendationsDto,
    userId: string,
    role: Role,
  ) {
    const { recommendations } = dto;
    const encryptedRecommendations =
      this.cryptoService.encrypt(recommendations);

    const consultation = await this.getById(id, userId, role);

    if (!consultation) {
      throw new NotFoundException("Консультация не найдена");
    }

    await this.prismaService.consultation.update({
      where: { id },
      data: { recommendations: encryptedRecommendations },
    });

    return { message: "Рекоммендации оставлены" };
  }

  async updateComments(
    id: string,
    dto: CommentsDto,
    userId: string,
    role: Role,
  ) {
    const { comments } = dto;
    const encryptedComments = this.cryptoService.encrypt(comments);

    const consultation = await this.getById(id, userId, role);

    if (!consultation) {
      throw new NotFoundException("Консультация не найдена");
    }

    await this.prismaService.consultation.update({
      where: { id },
      data: { comments: encryptedComments },
    });

    return { message: "Комментарий оставлен" };
  }

  private decrypt(recommendations?: string | null, comments?: string | null) {
    let decryptedRecommendations = "";
    let decryptedComments = "";

    if (recommendations) {
      decryptedRecommendations = this.cryptoService.decrypt(recommendations);
    }

    if (comments) {
      decryptedComments = this.cryptoService.decrypt(comments);
    }

    return {
      recommendations: decryptedRecommendations,
      comments: decryptedComments,
    };
  }
}
