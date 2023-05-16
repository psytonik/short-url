import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import { AuthCredentialsDto } from "../auth/dto/authCredentials.dto";
import { genSalt, hash } from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  async createUser(dto: AuthCredentialsDto): Promise<UserEntity> {
    const usersCount: number = await this.userRepo.count();
    const newUser: UserEntity = this.userRepo.create(dto);
    newUser.admin = usersCount === 0;
    try {
      const salt = await genSalt(10);
      newUser.password = await hash(newUser.password, salt);
      await this.userRepo.save(newUser);
      return newUser;
    } catch (e) {
      if (e.code === "23505") {
        throw new ConflictException(`User with this email already exists`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getUser(id: string): Promise<UserEntity> {
    const user: UserEntity = await this.userRepo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException("user not found or deleted");
    }
    return user;
  }

  async deleteUser(
    id: string
  ): Promise<{ message: string; statusCode: number }> {
    const userToDelete: UserEntity = await this.getUser(id);
    if (!userToDelete) {
      throw new UnprocessableEntityException("Something get wrong");
    } else if (userToDelete.id === id) {
      await this.userRepo.remove(userToDelete);
      return { message: "user removed", statusCode: 200 };
    }
  }

  async getUsers(): Promise<UserEntity[]> {
    return (await this.userRepo.find()) || [];
  }

  async findUser(email: string): Promise<UserEntity> {
    return await this.userRepo.findOneBy({ email });
  }
}
