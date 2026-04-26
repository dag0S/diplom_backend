import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";
import { CreateConsultationDto } from "./dto/create-consultation.dto";
import { RecommendationsDto } from "./dto/recommendations.dto";
import { CommentsDto } from "./dto/comments.dto";

@Injectable()
export class ConsultationService {
  constructor(private readonly prismaService: PrismaService) {}

  async getById(id: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException("Консультация не найдена");
    }

    return consultation;
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
    const consultation = await this.getById(id);

    if (!consultation) {
      throw new NotFoundException("Консультация не найдена");
    }

    return await this.prismaService.consultation.update({
      where: { id },
      data: { recommendations },
    });
  }

  async updateComments(id: string, dto: CommentsDto) {
    const { comments } = dto;
    const consultation = await this.getById(id);

    if (!consultation) {
      throw new NotFoundException("Консультация не найдена");
    }

    return await this.prismaService.consultation.update({
      where: { id },
      data: { comments },
    });
  }
}
