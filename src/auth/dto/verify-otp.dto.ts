import { IsEmail, IsString, Length } from "class-validator";

export class VerifyOtpDto {
  @IsString({ message: "Код обязателен" })
  @Length(6, 6, { message: "Код должен содержать ровно 6 символов" })
  otp: string;

  @IsString({ message: "Почта обязательна" })
  @IsEmail({}, { message: "Некорректный формат почты" })
  email: string;
}
