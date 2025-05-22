import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";
import { ResponseDto } from "../../utils/dto/response.dto";

export class LoginDto {
    @ApiProperty({
        example: "user@gmail.com",
        required: true
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "password",
        required: true
    })
    password: string;
}

export class LoginResponseDto extends ResponseDto {
    @ApiProperty({ description: 'Access Token', example: { accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." } })
    data: any;

    @ApiProperty({ example: 'Login successfull', description: 'Response message' })
    message: string;
}