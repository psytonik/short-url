import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { UrlsModule } from "./urls/urls.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          host: configService.get<string>("POSTGRES_HOST"),
          port: configService.get<number>("POSTGRES_PORT"),
          password: configService.get<string>("POSTGRES_PASSWORD"),
          username: configService.get<string>("POSTGRES_USER"),
          type: configService.get<"postgres">("DB_TYPE"),
          database: configService.get<string>("POSTGRES_DB"),
          entities: [__dirname + "/**/*.entity.js"],
          synchronize: true,
          // autoLoadEntities: true,
          logging: true,
        };
      },
    }),
    UsersModule,
    AuthModule,
    UrlsModule,
  ],
})
export class AppModule {}
