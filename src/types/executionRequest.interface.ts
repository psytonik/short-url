import { UserEntity } from "../users/user.entity";

export interface ExpressRequestInterface extends Request {
  user?: UserEntity;
}
