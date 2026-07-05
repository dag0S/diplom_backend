import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { verify } from "argon2";

import { UserService } from "src/user/user.service";
import { RegisterDto } from "./dto/register.dto";
import { AuthDto } from "./dto/auth.dto";
import type { JwtPayload } from "./interfaces/jwt.interface";
import { isDev } from "src/common/utils/is-dev.util";
import { OtpService } from "src/otp/otp.service";
import { EmailService } from "src/email/email.service";
import { SendEmailDto } from "src/email/dto/email.dto";
import type { Role, User } from "src/generated/prisma/client";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { SendOtpDto } from "./dto/send-otp.dto";
import { TotpService } from "src/totp/totp.service";
import { Verify2FADto, Verify2FAEmailDto } from "./dto/verify-2fa.dto";

@Injectable()
export class AuthService {
  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly totpService: TotpService,
    private readonly emailService: EmailService,
  ) {
    this.COOKIE_DOMAIN = configService.getOrThrow<string>("COOKIE_DOMAIN");
  }

  async login(res: Response, dto: AuthDto) {
    const user = await this.userService.getByEmail(dto.email);

    if (!user || !user.password) {
      throw new NotFoundException("Пользователь не найден");
    }

    const isValidPassword = await verify(user.password, dto.password);

    if (!isValidPassword) {
      throw new NotFoundException("Пользователь не найден");
    }

    if (!user.isEmailVerified) {
      await this.emailVerify(user);
      throw new UnauthorizedException(
        "Почта не подтверждена, код отправлен на почту",
      );
    }

    if (user.isTwoFactorEnabled) {
      throw new UnauthorizedException("Включена двухфакторная аутентификация");
    }

    return this.auth(res, user.id, user.role);
  }

  async register(dto: RegisterDto) {
    const existedUser = await this.userService.getByEmail(dto.email);

    if (existedUser)
      throw new BadRequestException("Пользователь уже существует");

    const user = await this.userService.create(dto);

    return this.emailVerify(user);
  }

  async verifyOtp(res: Response, dto: VerifyOtpDto) {
    const { otp, email } = dto;

    const user = await this.userService.getByEmail(email);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    await this.otpService.validateOtp(user.id, otp);

    await this.userService.verifyEmail(user.id);

    return this.auth(res, user.id, user.role);
  }

  async sendOtp(dto: SendOtpDto) {
    const { email } = dto;

    const user = await this.userService.getByEmail(email);

    if (!user) throw new NotFoundException("Пользователь не найден");

    return await this.emailVerify(user);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies["refresh_token"] as string;

    if (!refreshToken) {
      throw new UnauthorizedException("Недействительный refresh токен");
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException(
        "Невалидный или просроченный refresh-токен",
      );
    }

    if (!payload) {
      throw new UnauthorizedException("Недействительный refresh-токен");
    }

    const user = await this.userService.getById(payload.id);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    return this.auth(res, user.id, user.role);
  }

  logout(res: Response) {
    this.setCookie(res, "", new Date(0));

    return { message: "Успешный выход" };
  }

  async setup2FA(userId: string) {
    const user = await this.userService.getById(userId);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException("Двухфакторная аутентификация включена");
    }

    await this.totpService.deleteSecret(user.id);

    return await this.totpService.generateSecret(user.id);
  }

  async enable2FA(dto: Verify2FADto) {
    const { userId, code } = dto;

    const user = await this.userService.getById(userId);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    await this.totpService.validateTotp(user.id, code);

    await this.userService.setIsTwoFactorEnabled(user.id, true);

    return { message: "Двухфакторная аутентификация включена" };
  }

  async verify2FA(res: Response, dto: Verify2FAEmailDto) {
    const { email, code } = dto;

    const user = await this.userService.getByEmail(email);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException("Двухфакторная аутентификация выключена");
    }

    await this.totpService.validateTotp(user.id, code);

    return this.auth(res, user.id, user.role);
  }

  async disable2FA(dto: Verify2FADto) {
    const { userId, code } = dto;

    const user = await this.userService.getById(userId);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException(
        "Двухфакторная аутентификация уже выключена",
      );
    }

    await this.totpService.validateTotp(user.id, code);
    await this.totpService.deleteSecret(user.id);
    await this.userService.setIsTwoFactorEnabled(user.id, false);

    return { message: "Двухфакторная аутентификация выключена" };
  }

  private generateTokens(id: string, role: Role) {
    const payload: JwtPayload = { id, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "1h",
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: "7d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie("refresh_token", value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? "lax" : "none",
    });
  }

  private auth(res: Response, id: string, role: Role) {
    const { accessToken, refreshToken } = this.generateTokens(id, role);

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    );

    return { accessToken };
  }

  private async emailVerify(user: User) {
    const otp = await this.otpService.generateOTP(user.id);

    const emailDto: SendEmailDto = {
      recipients: [user.email],
      subject: "Подтверждение почты",
      html: `Ваш одноразовый код для подтверждения email: <b>${otp}</b><br/><br/>Срок действия кода: 5 мин.`,
    };

    await this.emailService.sendEmail(emailDto);

    return { message: `Код подтверждения отправлен на почту ${user.email}` };
  }

  async remove(userId: string, res: Response) {
    await this.userService.remove(userId);

    this.setCookie(res, "", new Date(0));

    return { message: "Аккаунт успешно удален" };
  }
}
