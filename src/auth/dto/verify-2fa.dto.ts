import { IsEmail, IsString, Length } from "class-validator";

export class Verify2FADto {
  @IsString({ message: "Код обязателен" })
  @Length(6, 6, { message: "Код должен содержать ровно 6 символов" })
  token: string;

  @IsString({ message: "Почта обязательна" })
  @IsEmail({}, { message: "Некорректный формат почты" })
  email: string;
}
