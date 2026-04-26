import { IsEmail, IsString } from "class-validator";

export class SendOtpDto {
  @IsString({ message: "Почта обязательна" })
  @IsEmail({}, { message: "Некорректный формат почты" })
  email: string;
}
