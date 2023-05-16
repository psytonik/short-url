import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { AuthCredentialsDto } from "./dto/authCredentials.dto";
import { compare } from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { JwtPayloadInterface } from "../types/jwt-payload.interface";
import { UserEntity } from "../users/user.entity";
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signUp(dto: AuthCredentialsDto) {
    return await this.userService.createUser(dto);
  }

  async signIn(dto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { email, password } = dto;
    const user: UserEntity = await this.userService.findUser(email);
    if (!user) {
      throw new NotFoundException(`User with this email ${email} not found`);
    }
    const isMatch: boolean = await compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Wrong Password");
    }
    const payload: JwtPayloadInterface = { email };
    const accessToken: string = await this.jwtService.signAsync(payload);
    return {
      accessToken,
    };
  }
}
