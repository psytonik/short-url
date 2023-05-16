import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserEntity } from "../../users/user.entity";
import { UsersService } from "../../users/users.service";
import { JwtPayloadInterface } from "../../types/jwt-payload.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private readonly configService: ConfigService
  ) {
    super({
      secretOrKey: configService.get("JWT_SECRET"),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: JwtPayloadInterface): Promise<UserEntity> {
    const { email } = payload;
    const user: UserEntity = await this.usersService.findUser(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
