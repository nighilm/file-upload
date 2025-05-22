import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { FileStatusResponseDto, UploadDto, UploadResponseDto } from './dto/upload.dto';
import { File, FileStatus } from '@prisma/client';
import { CustomThrottlerGuard } from '../auth/guards/throttle.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class UploadController {
    constructor(
        private readonly uploadService: UploadService
    ) { }

    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @ApiConsumes('multipart/form-data')
    @ApiCreatedResponse({
        description: 'Successful user login',
        type: UploadResponseDto,
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseGuards(CustomThrottlerGuard)
    @UseInterceptors(FileInterceptor('file', UploadService.getMulterOptions()))
    async uploadFile(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Body() { title, description }: UploadDto): Promise<UploadResponseDto> {
        const userId: number = req.user.id
        const fileId: number = await this.uploadService.uploadFile(userId, file, title, description)
        return {
            statusCode: HttpStatus.CREATED,
            data: {
                fileId, status: FileStatus.uploaded
            },
            message: "File upload successfull"
        };
    }

    @Get(':id')
    @ApiOkResponse({
        description: 'Successful user login',
        type: FileStatusResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    async getFileStatus(@Req() req: Request, @Param('id') fileId: string): Promise<FileStatusResponseDto> {
        const userId: number = req.user.id
        const result: Partial<File> = await this.uploadService.getFileStatus(userId, parseInt(fileId))
        return {
            statusCode: HttpStatus.OK,
            data: result,
            message: "File status"
        };
    }
}
