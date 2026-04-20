import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { ConsultationModule } from "./consultation/consultation.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    ConsultationModule,
    AuthModule,
  ],
})
export class AppModule {}
