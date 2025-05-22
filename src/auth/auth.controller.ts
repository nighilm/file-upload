
import { Body, Controller, Post, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  @ApiOkResponse({
    description: 'Successful user login',
    type: LoginResponseDto,
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const accessToken = await this.authService.login(loginDto.email, loginDto.password);
    return {
      statusCode: HttpStatus.OK,
      data: {
        accessToken
      },
      message: "Login successfull"
    }
  }
}
