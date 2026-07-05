import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { RegisterDto } from "./dto/register.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { SendOtpDto } from "./dto/send-otp.dto";
import { JwtAuth } from "./decorators/jwt-auth.decorator";
import { CurrentUser } from "src/common/decorators/user.decorator";
import { Verify2FADto, Verify2FAEmailDto } from "./dto/verify-2fa.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Res({ passthrough: true }) res: Response, @Body() dto: AuthDto) {
    return this.authService.login(res, dto);
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  verifyOtp(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: VerifyOtpDto,
  ) {
    return this.authService.verifyOtp(res, dto);
  }

  @Post("send-otp")
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post("setup-2fa")
  @JwtAuth()
  @HttpCode(HttpStatus.OK)
  setup2FA(@CurrentUser("id") userId: string) {
    return this.authService.setup2FA(userId);
  }

  @Post("enable-2fa")
  @JwtAuth()
  @HttpCode(HttpStatus.OK)
  enable2FA(@Body() dto: Verify2FADto) {
    return this.authService.enable2FA(dto);
  }

  @Post("disable-2fa")
  @JwtAuth()
  @HttpCode(HttpStatus.OK)
  disable2FA(@Body() dto: Verify2FADto) {
    return this.authService.disable2FA(dto);
  }

  @Post("verify-2fa")
  @HttpCode(HttpStatus.OK)
  verify2FA(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: Verify2FAEmailDto,
  ) {
    return this.authService.verify2FA(res, dto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Delete("remove")
  @HttpCode(HttpStatus.OK)
  @JwtAuth()
  remove(
    @CurrentUser("id") id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.remove(id, res);
  }
}
