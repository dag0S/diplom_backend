import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";

import { UserService } from "./user.service";
import { CurrentUser } from "../common/decorators/user.decorator";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("doctors")
  @HttpCode(HttpStatus.OK)
  @JwtAuth("PATIENT")
  getAllDoctors() {
    return this.userService.getAllDoctors();
  }

  @Get("profile")
  @HttpCode(HttpStatus.OK)
  @JwtAuth()
  getProfile(@CurrentUser("id") id: string) {
    return this.userService.getById(id);
  }
}
