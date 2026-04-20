import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";

import { Role } from "src/generated/prisma/enums";

export class RegisterDto {
  @IsString({ message: "Почта должна быть строкой" })
  @IsNotEmpty({ message: "Почта не может быть пустой" })
  @IsEmail({}, { message: "Некорректный формат почты" })
  email: string;

  @IsString({ message: "Пароль должен быть строкой" })
  @IsNotEmpty({ message: "Пароль не может быть пустым" })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ",
    },
  )
  password: string;

  @IsString({ message: "Подтверждение пароля должно быть строкой" })
  @IsNotEmpty({ message: "Подтверждение пароля не может быть пустым" })
  @IsStrongPassword(
    {},
    {
      validateIf: (dto: RegisterDto, value) => dto.password !== value,
      message: "Пароли не совпадают",
    },
  )
  confirmPassword: string;

  @IsString({ message: "Имя должно быть строкой" })
  @IsNotEmpty({ message: "Имя не может быть пустым" })
  firstName: string;

  @IsString({ message: "Фамилия должна быть строкой" })
  @IsNotEmpty({ message: "Фамилия не может быть пустой" })
  lastName: string;

  @IsString({ message: "Отчество должно быть строкой" })
  @IsOptional()
  middleName?: string;

  @IsEnum(Role, {
    message:
      "Роль должна быть одной из следующих: " + Object.values(Role).join(", "),
  })
  @IsNotEmpty({ message: "Роль не может быть пустой" })
  role: Role;
}
