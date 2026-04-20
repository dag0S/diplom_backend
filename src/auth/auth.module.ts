import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Module } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { getJwtConfig } from "src/common/config/jwt.config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    UserModule,
    PassportModule,
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
