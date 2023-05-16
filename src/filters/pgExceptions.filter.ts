import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { QueryFailedError } from "typeorm";

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessages = {
      "23505": "Duplicate value",
      "23503": "Foreign key constraint violation",
      "23502": "Null value in column that is declared NOT NULL",
      "22001": "String value is too long",
      "22003": "Numeric value out of range",
      "22007": "Invalid datetime format",
      "22012": "Division by zero",
      "22023": "Invalid parameter",
      "22P02": "Invalid text representation of a numeric value",
      "22P05": "Unknown (unsupported) character encoding",
      "42703": "Unknown column",
      "42P01": "Unknown table",
      "42P07": "Table already exists",
      "42601": "Syntax error",
    };

    const message = errorMessages[(exception as any).code]
      ? errorMessages[(exception as any).code]
      : "Unexpected database error";

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
