import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAME } from 'src/utils/constants';

@Injectable()
export class QueueProducerService {
    constructor(@InjectQueue(QUEUE_NAME) private readonly queue: Queue) { }

    async addQue(data: any) {
        await this.queue.add(QUEUE_NAME, data, {
            attempts: 3,
            backoff: 5000,
        });
    }
}