import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message = typeof res === 'string' ? res : (res as any).message || res;
        }

        else if (exception instanceof MulterError) {
            status = HttpStatus.PAYLOAD_TOO_LARGE;
            message = 'Uploaded file is too large. Max allowed size exceeded.';
        }

        else if (exception instanceof Error) {
            message = exception.message || 'Unexpected error';
        }

        response.status(status).json({
            statusCode: status,
            data: {},
            message: message
        });
    }
}
