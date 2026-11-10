import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

/** Respuestas 400/401/404 sin cuerpo, como el mock Python original. */
@Catch(HttpException)
export class EmptyBodyHttpFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const status = exception.getStatus();
    const response = host.switchToHttp().getResponse<Response>();
    if (status === 400 || status === 401 || status === 404) {
      response.status(status).send();
      return;
    }
    response.status(status).json(exception.getResponse());
  }
}
