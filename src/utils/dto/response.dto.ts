import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto {
    @ApiProperty({ example: 200, description: 'HTTP status code' })
    statusCode: number;
}