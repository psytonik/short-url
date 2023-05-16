import { Module } from "@nestjs/common";
import { UrlsController } from "./urls.controller";
import { UrlsService } from "./urls.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UrlEntity } from "./url.entity";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [
    TypeOrmModule.forFeature([UrlEntity]),
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  controllers: [UrlsController],
  providers: [UrlsService],
})
export class UrlsModule {}
