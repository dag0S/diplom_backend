import { Role } from "src/generated/prisma/enums";

export class RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: Role;
}
