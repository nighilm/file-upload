import { OnWorkerEvent, Processor, WorkerHost, } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { createReadStream, existsSync } from 'fs';
import { extname } from 'path';
import { createInterface } from 'readline';
import { JobsService } from './jobs.service';
import { FileStatus, JobStatus } from '@prisma/client';
import { QUEUE_NAME } from 'src/utils/constants';

@Processor(QUEUE_NAME)
@Injectable()
export class QueueConsumerService extends WorkerHost {
    constructor(
        private readonly jobService: JobsService
    ) {
        super()
    }

    async process(job: Job<any>): Promise<any> {
        try {
            const { storagePath } = job.data

            if (!existsSync(storagePath)) {
                throw new Error(`File not found: ${storagePath}`);
            }

            let lastLine = '';
            const ext = extname(storagePath).toLowerCase();
            if (ext !== '.txt') {
                throw new Error(`Invalid file type. Only .txt files are processed. Got: ${ext}`);
            }

            const fileStream = createReadStream(storagePath, { encoding: 'utf-8' });

            const rl = createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });

            for await (const line of rl) {
                lastLine = line;
            }
            return lastLine
        } catch (error) {
            throw error;
        }
    }


    @OnWorkerEvent('active')
    async onProcessing(job: Job) {
        try {
            const { jobId, fileId } = job.data
            const jobStatus: JobStatus = JobStatus.processing
            const fileStatus: FileStatus = FileStatus.processing
            await this.jobService.updateJobStatus(jobId, fileId, jobStatus, fileStatus, new Date(), null, null, null)
        } catch (error) {
            console.error("Failed to update job status: ", error);
        }
    }

    @OnWorkerEvent('completed')
    async onCompleted(job: Job) {
        try {
            const { jobId, fileId } = job.data
            const jobStatus: JobStatus = JobStatus.completed
            const fileStatus: FileStatus = FileStatus.processed
            await this.jobService.updateJobStatus(jobId, fileId, jobStatus, fileStatus, null, new Date(), job.returnvalue, null)
        } catch (error) {
            console.error("Failed to update job status: ", error);
        }
    }

    @OnWorkerEvent('failed')
    async onError(job: Job) {
        try {
            const { jobId, fileId } = job.data
            const jobStatus: JobStatus = JobStatus.failed
            const fileStatus: FileStatus = FileStatus.failed
            await this.jobService.updateJobStatus(jobId, fileId, jobStatus, fileStatus, null, new Date(), null, job.failedReason)
        } catch (error) {
            console.error("Failed to update job status: ", error);
        }
    }

}