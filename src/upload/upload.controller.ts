import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { FileStatusResponseDto, UploadDto, UploadResponseDto } from './dto/upload.dto';
import { File, FileStatus } from '@prisma/client';

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
    @UseInterceptors(FileInterceptor('file', UploadService.getMulterOptions()))
    async uploadFile(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Body() { title, description }: UploadDto): Promise<UploadResponseDto> {
        try {
            const userId: number = req.user.id
            const fileId: number = await this.uploadService.uploadFile(userId, file, title, description)
            return {
                statusCode: HttpStatus.CREATED,
                data: {
                    fileId, status: FileStatus.uploaded
                },
                message: "File upload successfull"
            };

        } catch (error) {
            return {
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                data: {},
                message: error?.message || "Internal Server Error"
            }
        }
    }

    @Get(':id')
    @ApiOkResponse({
        description: 'Successful user login',
        type: FileStatusResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    async getFileStatus(@Req() req: Request, @Param('id') fileId: string): Promise<FileStatusResponseDto> {
        try {
            const userId: number = req.user.id
            const result: Partial<File> = await this.uploadService.getFileStatus(userId, parseInt(fileId))
            return {
                statusCode: HttpStatus.OK,
                data: result,
                message: "File status"
            };
        } catch (error) {
            return {
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                data: {},
                message: error?.message || "Internal Server Error"
            }
        }
    }
}
