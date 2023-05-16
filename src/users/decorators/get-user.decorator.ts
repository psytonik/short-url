import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ExpressRequestInterface } from "../../types/executionRequest.interface";
import { UserEntity } from "../user.entity";

export const GetUserDecorator = createParamDecorator(
  (data: any, ctx: ExecutionContext): UserEntity | null => {
    const request = ctx.switchToHttp().getRequest<ExpressRequestInterface>();
    if (!request.user) {
      return null;
    }
    if (data) {
      return request.user[data];
    }
    return request.user;
  }
);
