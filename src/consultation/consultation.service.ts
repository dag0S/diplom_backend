import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";
import { CreateConsultationDto } from "./dto/create-consultation.dto";
import { RecommendationsDto } from "./dto/recommendations.dto";
import { CommentsDto } from "./dto/comments.dto";
import { CryptoService } from "src/crypto/crypto.service";

@Injectable()
export class ConsultationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async getById(id: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
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

    const decryptedCommentsAndRecommendations = this.decrypt(
      consultation?.recommendations,
      consultation?.comments,
    );

    if (!consultation) {
      throw new NotFoundException("Консультация не найдена");
    }

    return {
      ...consultation,
      ...decryptedCommentsAndRecommendations,
    };
  }

  async getAll() {
    return await this.prismaService.consultation.findMany();
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

    return this.prismaService.consultation.create({
      data: {
        doctorId: dto.doctorId,
        patientId: dto.patientId,
      },
    });
  }

  async updateRecommendations(id: string, dto: RecommendationsDto) {
    const { recommendations } = dto;
    const encryptedRecommendations =
      this.cryptoService.encrypt(recommendations);

    const consultation = await this.getById(id);

    if (!consultation) {
      throw new NotFoundException("Консультация не найдена");
    }

    return await this.prismaService.consultation.update({
      where: { id },
      data: { recommendations: encryptedRecommendations },
    });
  }

  async updateComments(id: string, dto: CommentsDto) {
    const { comments } = dto;
    const encryptedComments = this.cryptoService.encrypt(comments);

    const consultation = await this.getById(id);

    if (!consultation) {
      throw new NotFoundException("Консультация не найдена");
    }

    return await this.prismaService.consultation.update({
      where: { id },
      data: { comments: encryptedComments },
    });
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
