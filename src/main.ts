import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  });

  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
