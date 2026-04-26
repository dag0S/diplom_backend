import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Module } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { getJwtConfig } from "src/common/config/jwt.config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UserModule } from "src/user/user.module";
import { OtpModule } from "src/otp/otp.module";
import { EmailModule } from "src/email/email.module";
import { TotpModule } from "src/totp/totp.module";

@Module({
  imports: [
    UserModule,
    OtpModule,
    TotpModule,
    PassportModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
