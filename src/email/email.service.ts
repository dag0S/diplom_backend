import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, type SendMailOptions } from "nodemailer";

import { SendEmailDto } from "./dto/email.dto";

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  private emailTransport() {
    const transporter = createTransport({
      host: this.configService.getOrThrow<string>("EMAIL_HOST"),
      port: this.configService.getOrThrow<number>("EMAIL_PORT"),
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>("EMAIL_USER"),
        pass: this.configService.getOrThrow<string>("EMAIL_PASSWORD"),
      },
    });

    return transporter;
  }

  async sendEmail(dto: SendEmailDto) {
    const { html, recipients, subject } = dto;

    const transport = this.emailTransport();

    const options: SendMailOptions = {
      from: this.configService.getOrThrow<string>("EMAIL_USER"),
      to: recipients,
      subject,
      html,
    };

    try {
      await transport.sendMail(options);
    } catch (error) {
      console.error("Ошибка при отправке почты:", error);
      throw new InternalServerErrorException("Не удалось отправить письмо");
    }

    return { message: "Письмо отправлено" };
  }
}
