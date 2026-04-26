import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { ConsultationModule } from "./consultation/consultation.module";
import { AuthModule } from "./auth/auth.module";
import { OtpModule } from './otp/otp.module';
import { EmailModule } from './email/email.module';
import { TotpModule } from './totp/totp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    ConsultationModule,
    AuthModule,
    OtpModule,
    EmailModule,
    TotpModule,
  ],
})
export class AppModule {}
