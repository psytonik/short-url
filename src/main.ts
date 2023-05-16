import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { Logger, ValidationPipe } from "@nestjs/common";
import * as compression from "compression";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { UrlsModule } from "./urls/urls.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.create(AppModule, { cors: true });
  const PORT = configService.get<number>("APP_PORT") || 4001;
  const logger = new Logger("MAIN");
  app.use(compression());
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle("Links Management System")
    .setDescription("API for links shorten service")
    .setVersion("1.1")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [AppModule, UsersModule, AuthModule, UrlsModule],
  });
  SwaggerModule.setup("docs", app, document);

  await app.listen(PORT);
  logger.log(`This application running on port ${PORT}`);
}
bootstrap().then();
