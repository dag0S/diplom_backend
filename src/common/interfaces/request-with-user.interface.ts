import type { Request } from "express";

import type { User } from "src/generated/prisma/client";

export interface RequestWithUser extends Request {
  user?: User;
}
