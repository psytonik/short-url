import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Redirect,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UrlsService } from "./urls.service";
import { UrlEntity } from "./url.entity";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateUrlDto } from "./dto/create-url.dto";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { GetUserDecorator } from "../users/decorators/get-user.decorator";
import { UserEntity } from "../users/user.entity";
import { OptionalGuard } from "../guards/optional.guard";

@ApiTags("Urls")
@Controller()
export class UrlsController {
  constructor(private readonly urlService: UrlsService) {}

  @ApiOperation({ summary: "Generate short url" })
  @ApiResponse({
    status: 201,
    description: "The short url successfully generated",
  })
  @UseGuards(OptionalGuard)
  @ApiBearerAuth()
  @Post("/url")
  async shortUrl(
    @Body() fullUrl: CreateUrlDto,
    @Req() request: Request,
    @GetUserDecorator() user: UserEntity
  ): Promise<UrlEntity> {
    return await this.urlService.create(fullUrl, request, user);
  }

  @Get("/:code")
  @Redirect("/url", 302)
  async getOriginalUrl(@Param("code") code: string): Promise<{ url: string }> {
    const url: UrlEntity = await this.urlService.find(code);
    await this.urlService.incrementClickCount(code);
    return { url: url.fullUrl };
  }

  @ApiOperation({ summary: "Click statistic" })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get("/url/stats/:code")
  async getUrlStats(
    @Param("code") code: string,
    @GetUserDecorator() currentUser: UserEntity
  ): Promise<UrlEntity> {
    return await this.urlService.statForUrl(code, currentUser);
  }
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get("/url/all")
  async getUrls(@GetUserDecorator() currentUser: UserEntity) {
    return await this.urlService.getAll(currentUser);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Delete("/url/:code")
  async removeUrl(
    @Param("code") code: string,
    @GetUserDecorator() currentUser: UserEntity
  ): Promise<{ message: string; statusCode: number }> {
    return await this.urlService.deleteUrl(code, currentUser);
  }
}
