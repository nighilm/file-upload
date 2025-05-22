import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { QueueModule } from './queue/queue.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UploadModule,
    QueueModule,
    ThrottlerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: 60,
            limit: 10
          }
        ],
        storage: new ThrottlerStorageRedisService({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        }),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    })
  ],
})
export class AppModule { }
