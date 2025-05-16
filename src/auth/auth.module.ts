import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './jwt.guard';

@Module({
  imports: [UsersModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'secret',
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_VALIDITY_DURATION || '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService]
})
export class AuthModule { }
