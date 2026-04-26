import { IsString } from "class-validator";

export class RecommendationsDto {
  @IsString({ message: "Рекомендации должны быть строкой" })
  recommendations: string;
}
