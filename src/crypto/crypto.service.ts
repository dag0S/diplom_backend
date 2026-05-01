import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import CryptoJS from "crypto-js";

@Injectable()
export class CryptoService {
  private readonly CRYPTO_KEY: string;

  constructor(private readonly configService: ConfigService) {
    this.CRYPTO_KEY = configService.getOrThrow<string>("CRYPTO_KEY");
  }

  encrypt(text: string) {
    return CryptoJS.AES.encrypt(text, this.CRYPTO_KEY).toString();
  }

  decrypt(encryptedText: string) {
    return CryptoJS.AES.decrypt(encryptedText, this.CRYPTO_KEY).toString(
      CryptoJS.enc.Utf8,
    );
  }
}
