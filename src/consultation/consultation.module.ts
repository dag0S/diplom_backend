import { Module } from "@nestjs/common";

import { ConsultationService } from "./consultation.service";
import { ConsultationController } from "./consultation.controller";
import { CryptoModule } from "src/crypto/crypto.module";

@Module({
  imports: [CryptoModule],
  controllers: [ConsultationController],
  providers: [ConsultationService],
})
export class ConsultationModule {}
