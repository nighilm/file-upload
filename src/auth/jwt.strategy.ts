import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from "../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService

    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<Partial<User> | null> {
        const { id } = payload;
        const user: Partial<User> | null = await this.usersService.findUserById(id);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }
}
