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
import { JwtPayload } from "./interfaces/jwt.interface";
import { isDev } from "src/common/utils/is-dev.util";

@Injectable()
export class AuthService {
  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
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

    return this.auth(res, user.id);
  }

  async register(res: Response, dto: RegisterDto) {
    const existedUser = await this.userService.getByEmail(dto.email);

    if (existedUser)
      throw new BadRequestException("Пользователь уже существует");

    const user = await this.userService.create(dto);

    return this.auth(res, user.id);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies["refreshToken"] as string;

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

    return this.auth(res, user.id);
  }

  logout(res: Response) {
    this.setCookie(res, "", new Date(0));

    return { message: "Успешный выход" };
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };

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
    res.cookie("refreshToken", value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? "lax" : "none",
    });
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    );

    return { accessToken };
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();

    expiresIn.setDate(expiresIn.getDate() + 7);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      domain: this.configService.getOrThrow<string>("SERVER_DOMAIN"),
      expires: expiresIn,
      secure: true,
      sameSite: "none",
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie("refreshToken", "", {
      httpOnly: true,
      domain: this.configService.getOrThrow<string>("SERVER_DOMAIN"),
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    });
  }
}
