import { IsEmail, IsString } from "class-validator";

export class AuthDto {
  @IsString({ message: "Почта обязательна" })
  @IsEmail({}, { message: "Некорректный формат почты" })
  email: string;

  @IsString({ message: "Пароль обязателен" })
  password: string;
}
