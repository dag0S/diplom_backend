import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { RequestWithUser } from "src/common/interfaces/request-with-user.interface";
import type { User } from "src/generated/prisma/client";

export const CurrentUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
