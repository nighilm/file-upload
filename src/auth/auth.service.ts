import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { generateJwtToken } from '../utils/jwt.helper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
    ) { }

    async login(email: string, pass: string): Promise<string> {
        try {
            const user: User = await this.usersService.findUserByEmail(email);
            const isMatch: boolean = await bcrypt.compare(pass, user?.password);
            if (!user || !isMatch) {
                throw new UnauthorizedException();
            }
            const payload: { id: number } = { id: user.id }
            const accessToken: string = generateJwtToken(payload);
            return accessToken
        } catch (error) {
            throw error
        }
    }

}
