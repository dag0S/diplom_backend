import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { Role } from "src/generated/prisma/enums";
import { RoleGuard } from "../guards/role.guard";

export const JwtAuth = (...roles: Role[]) => {
  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(JwtAuthGuard, RoleGuard),
  );
};
