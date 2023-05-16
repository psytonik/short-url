import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UserEntity } from "./user.entity";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../guards/admin.guard";

@ApiTags("Users")
@UseGuards(AuthGuard(), AdminGuard)
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "returning array of users" })
  @Get()
  async getUsers(): Promise<UserEntity[]> {
    return this.usersService.getUsers();
  }
  @Get("/:id")
  async getUser(@Param("id", ParseUUIDPipe) id: string): Promise<UserEntity> {
    return this.usersService.getUser(id);
  }
  @Delete("/:id")
  async deleteUser(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<{ message: string; statusCode: number }> {
    return await this.usersService.deleteUser(id);
  }
}
