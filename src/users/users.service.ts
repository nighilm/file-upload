
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({ where: { email } })
    return user
  }

  async findUserById(id: number): Promise<Partial<User> | null> {
    const user = await this.prismaService.user.findFirst({ where: { id }, select: { id: true, email: true } })
    return user
  }
}
