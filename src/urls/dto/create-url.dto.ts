import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUrlDto {
  @ApiProperty()
  @IsString()
  fullUrl: string;
}
