import { applyDecorators, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../guards/jwt-auth.guard";

export const JwtAuth = () => {
  return applyDecorators(UseGuards(JwtAuthGuard));
};
