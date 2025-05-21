import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { File } from '@prisma/client';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../queue/jobs.service';

@Injectable()
export class UploadService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jobsService: JobsService,
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

            const fileObj: File = await this.prismaService.file.create({
                data: {
                    originalFilename: file.originalname,
                    userId,
                    storagePath: file.path,
                    title,
                    description
                }
            })

            await this.jobsService.createJob(fileObj.id, file.path)

            return fileObj.id
        } catch (error) {
            throw error
        }
    }

    async getFileStatus(userId: number, fileId: number): Promise<Partial<File>> {
        try {
            const file: Partial<File> | null = await this.prismaService.file.findFirst({
                where: { id: fileId, userId },
                select: {
                    originalFilename: true,
                    title: true,
                    description: true,
                    storagePath: true,
                    status: true,
                    extractedData: true,
                }
            })

            if (!file) {
                throw new NotFoundException("File details not found for the user")
            }

            return file
        } catch (error) {
            throw error
        }
    }
}
