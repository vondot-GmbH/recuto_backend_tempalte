import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { I18nContext } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@InjectSentry() private readonly logger: SentryService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log(exception);
    const i18n = I18nContext.current(host);

    const ctx = host.switchToHttp();

    const response = ctx.getResponse();
    const statusCode = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Perpare error for client
    const errorResponse = {
      status: statusCode,
      createdBy: 'HttpExceptionFilter',
      date: new Date(),
      expection: exception.message,
      readableMessage: exceptionResponse.messagePath
        ? i18n.t(exceptionResponse.messagePath)
        : exception.message,
    };

    // Logging
    this.logger.instance().captureException(exception);

    return response.status(statusCode).json(errorResponse);
  }
}
