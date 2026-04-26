import { IsString } from "class-validator";

export class CommentsDto {
  @IsString({ message: "Комментарии должны быть строкой" })
  comments: string;
}
