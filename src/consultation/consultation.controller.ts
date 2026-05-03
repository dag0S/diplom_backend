import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { ConsultationService } from "./consultation.service";
import { CreateConsultationDto } from "./dto/create-consultation.dto";
import { RecommendationsDto } from "./dto/recommendations.dto";
import { CommentsDto } from "./dto/comments.dto";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";
import { CurrentUser } from "src/common/decorators/user.decorator";
import { Role } from "src/generated/prisma/enums";

@Controller("consultations")
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @JwtAuth()
  getAll(@CurrentUser("id") id: string, @CurrentUser("role") role: Role) {
    return this.consultationService.getAll(id, role);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @JwtAuth()
  getById(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: Role,
  ) {
    return this.consultationService.getById(id, userId, role);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @JwtAuth("PATIENT")
  create(@Body() dto: CreateConsultationDto) {
    return this.consultationService.create(dto);
  }

  @Patch(":id/recommendations")
  @HttpCode(HttpStatus.OK)
  @JwtAuth("DOCTOR")
  updateRecommendations(
    @Param("id") id: string,
    @Body() dto: RecommendationsDto,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: Role,
  ) {
    return this.consultationService.updateRecommendations(
      id,
      dto,
      userId,
      role,
    );
  }

  @Patch(":id/comments")
  @HttpCode(HttpStatus.OK)
  @JwtAuth("PATIENT")
  updateComments(
    @Param("id") id: string,
    @Body() dto: CommentsDto,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: Role,
  ) {
    return this.consultationService.updateComments(id, dto, userId, role);
  }
}
