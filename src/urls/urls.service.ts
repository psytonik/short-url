import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UrlEntity } from "./url.entity";
import { Repository } from "typeorm";
import { nanoid } from "nanoid";
import { lookup } from "node:dns";
import { promisify } from "node:util";
import { CreateUrlDto } from "./dto/create-url.dto";
import { Request } from "express";
import { UserEntity } from "../users/user.entity";

const dnsLookup = promisify(lookup);

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(UrlEntity)
    private readonly urlsRepository: Repository<UrlEntity>
  ) {}

  async create(
    { fullUrl }: CreateUrlDto,
    request: Request,
    user: UserEntity
  ): Promise<UrlEntity> {
    let parsedUrl;

    try {
      if (!/^https?:\/\//i.test(fullUrl)) {
        fullUrl = "http://" + fullUrl;
      }
      parsedUrl = new URL(fullUrl);
    } catch (e) {
      throw new BadRequestException("Invalid URL");
    }
    try {
      await dnsLookup(parsedUrl.hostname);
    } catch (err) {
      throw new BadRequestException("Unreachable URL");
    }
    const code = nanoid(7);
    const url = this.urlsRepository.create({
      fullUrl,
      code,
      shortUrl: `${request.protocol}://${request.get("host")}/${code}`,
      user: user,
    });
    return await this.urlsRepository.save(url);
  }

  async find(code: string): Promise<UrlEntity> {
    const url: UrlEntity = await this.urlsRepository.findOneBy({ code });
    if (url && (await url).fullUrl) {
      return url;
    }
    throw new NotFoundException("URL not found");
  }

  async incrementClickCount(shortUrl: string): Promise<void> {
    const url = await this.find(shortUrl);
    if (url) {
      url.clickCount++;
      await this.urlsRepository.save(url);
    }
  }

  async getAll(currentUser: UserEntity): Promise<UrlEntity[]> {
    if (currentUser.admin === true) {
      return await this.urlsRepository.find();
    }
    return await this.urlsRepository.findBy({ user: { id: currentUser.id } });
  }

  async deleteUrl(
    code,
    currentUser
  ): Promise<{ message: string; statusCode: number }> {
    const urlToRemove = await this.urlsRepository.findOneBy({ code });
    if (!urlToRemove) {
      throw new NotFoundException(
        `url with this code: ${code} not found or removed`
      );
    }
    if (urlToRemove.user !== currentUser.id && currentUser.admin === false) {
      throw new ForbiddenException("You aren't authorized to delete this link");
    }
    await this.urlsRepository.remove(urlToRemove);
    return { message: "Url removed", statusCode: 200 };
  }

  async statForUrl(code: string, currentUser: UserEntity): Promise<UrlEntity> {
    const url: UrlEntity = await this.urlsRepository.findOneBy({ code });
    if (
      url.user.id !== currentUser.id ||
      url.user.admin !== currentUser.admin
    ) {
      throw new ForbiddenException("Not authorized to be here");
    }
    if (url && (await url).fullUrl) {
      return url;
    }
    throw new NotFoundException("URL not found");
  }
}
