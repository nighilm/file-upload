import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UploadModule,
    QueueModule,
  ],
})
export class AppModule { }
