import { IsEmail, IsString, Length } from "class-validator";

export class Verify2FAEmailDto {
  @IsString({ message: "Код обязателен" })
  @Length(6, 6, { message: "Код должен содержать ровно 6 символов" })
  code: string;

  @IsString({ message: "Почта обязательна" })
  @IsEmail({}, { message: "Некорректный формат почты" })
  email: string;
}

export class Verify2FADto {
  @IsString({ message: "Код обязателен" })
  @Length(6, 6, { message: "Код должен содержать ровно 6 символов" })
  code: string;

  @IsString({ message: "ID пользователя обязателен" })
  userId: string;
}
