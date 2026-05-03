import { Role } from "src/generated/prisma/enums";

export interface JwtPayload {
  id: string;
  role: Role;
}
