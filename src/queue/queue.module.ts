import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { QueueProducerService } from './queue-producer.service';
import { QueueConsumerService } from './queue-consumer.service';
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import * as  basicAuth from 'express-basic-auth';
import { JobsService } from './jobs.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QUEUE_NAME } from 'src/utils/constants';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: QUEUE_NAME }),
    BullBoardModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        route: configService.get<string>('BULL_BOARD_ADMIN_ROUTE'),
        adapter: ExpressAdapter,
        middleware: basicAuth({
          challenge: true,
          users: { admin: configService.get<string>('BULL_BOARD_ADMIN_PASSWORD') },
        }),
      }),
      inject: [ConfigService]
    }),
    BullBoardModule.forFeature({
      name: QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    PrismaModule
  ],
  providers: [QueueProducerService, QueueConsumerService, JobsService],
  exports: [JobsService],
})
export class QueueModule { }
