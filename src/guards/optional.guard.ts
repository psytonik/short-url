import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalGuard extends AuthGuard("jwt") {
  handleRequest(err, user, info, context) {
    return user;
  }
}
