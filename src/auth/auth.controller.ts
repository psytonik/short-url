import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthCredentialsDto } from "./dto/authCredentials.dto";
import { AuthService } from "./auth.service";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { UserEntity } from "../users/user.entity";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Sign Up User" })
  @ApiResponse({
    status: 201,
    description: "The user has been successfully created",
  })
  @ApiResponse({ status: 400, description: "Not Provided Email or Password" })
  @HttpCode(HttpStatus.CREATED)
  @Post("sign-up")
  async signUp(@Body() dto: AuthCredentialsDto) {
    return await this.authService.signUp(dto);
  }

  @ApiOperation({ summary: "Sign In User" })
  @ApiResponse({ status: 200, description: "Authorized" })
  @ApiResponse({ status: 400, description: "Wrong Email Format" })
  @ApiResponse({ status: 401, description: "Wrong Password" })
  @ApiResponse({ status: 404, description: "User not exists" })
  @Post("sign-in")
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: AuthCredentialsDto
  ): Promise<{ accessToken: string }> {
    return await this.authService.signIn(dto);
  }

  @ApiResponse({ status: 200, description: "Get user" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Post("/current")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  currentUser(@Req() req: Request): { accessToken: string; email } {
    const accessToken: string = req.headers.authorization.split(" ")[1];
    return {
      email: (req.user as UserEntity).email,
      accessToken,
    };
  }
}
