import { Controller, Get } from "@nestjs/common";

import { UserService } from "./user.service";
import { CurrentUser } from "./decorators/user.decorator";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  getProfile(@CurrentUser("id") id: string) {
    return this.userService.getById(id);
  }
}
