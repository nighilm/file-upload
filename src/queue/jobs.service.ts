import { Injectable } from '@nestjs/common';
import { FileStatus, Job, JobStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueueProducerService } from '../queue/queue-producer.service';
import { QUEUE_NAME } from '../utils/constants';

@Injectable()
export class JobsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly queueProducerService: QueueProducerService,
    ) { }

    async createJob(fileId: number, storagePath: string): Promise<void> {
        try {

            const job: Job = await this.prismaService.job.create({
                data: {
                    fileId,
                    jobType: QUEUE_NAME,
                    status: JobStatus.queued,
                }
            })
            await this.queueProducerService.addQue({
                jobId: job.id,
                fileId,
                storagePath,
            });
        } catch (error) {
            throw error
        }
    }

    async updateJobStatus(jobId: number, fileId: number, jobStatus: JobStatus, fileStatus: FileStatus, startedAt: Date, completedAt: Date, extractedData: string, errorMessage: string) {
        try {
            const existingJob: Partial<Job> = await this.prismaService.job.findUnique({
                where: { id: jobId },
                select: { startedAt: true }
            });
            await this.prismaService.job.update({
                where: { id: jobId },
                data: {
                    status: jobStatus,
                    ...(existingJob.startedAt === null && startedAt && { startedAt }),
                    ...(completedAt && { completedAt }),
                    ...(errorMessage && { errorMessage })
                }
            })
            await this.prismaService.file.update({
                where: { id: fileId },
                data: {
                    status: fileStatus,
                    ...(extractedData && { extractedData })
                }
            })

        } catch (error) {
            throw error
        }
    }
}
