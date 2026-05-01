import { Module } from "@nestjs/common";

import { TotpService } from "./totp.service";
import { CryptoModule } from "src/crypto/crypto.module";

@Module({
  imports: [CryptoModule],
  providers: [TotpService],
  exports: [TotpService],
})
export class TotpModule {}
