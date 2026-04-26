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

@Controller("consultations")
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAll() {
    return this.consultationService.getAll();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  getById(@Param("id") id: string) {
    return this.consultationService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateConsultationDto) {
    return this.consultationService.create(dto);
  }

  @Patch(":id/recommendations")
  @HttpCode(HttpStatus.OK)
  updateRecommendations(
    @Param("id") id: string,
    @Body() dto: RecommendationsDto,
  ) {
    return this.consultationService.updateRecommendations(id, dto);
  }

  @Patch(":id/comments")
  @HttpCode(HttpStatus.OK)
  updateComments(@Param("id") id: string, @Body() dto: CommentsDto) {
    return this.consultationService.updateComments(id, dto);
  }
}
