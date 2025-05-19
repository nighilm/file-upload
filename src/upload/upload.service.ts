import { BadRequestException, Injectable } from '@nestjs/common';
import { File } from '@prisma/client';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UploadService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    static getMulterOptions() {
        return {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const userId: number = req.user.id
                    const uploadPath: string = `./uploads/${userId}`;
                    mkdirSync(uploadPath, { recursive: true });
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const filename: string = `file_${Date.now()}${extname(file.originalname)}`;
                    cb(null, filename);
                },
            }),
        };
    }

    async uploadFile(userId: number, file: Express.Multer.File, title?: string, description?: string): Promise<number> {
        try {
            if (!file) {
                throw new BadRequestException("Please upload a file")
            }
            const originalFilename: string = file.originalname
            const newFileName: string = `file_${Date.now()}${extname(file.originalname)}`;
            const storagePath: string = `${userId}/${newFileName}`;
            const fileObj: File = await this.prismaService.file.create({
                data: {
                    originalFilename,
                    userId,
                    storagePath,
                    title,
                    description
                }
            })
            return fileObj.id
        } catch (error) {
            throw error
        }
    }

}
