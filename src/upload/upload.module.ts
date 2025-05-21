import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [PrismaModule, QueueModule],
  providers: [UploadService],
  controllers: [UploadController]
})
export class UploadModule { }
