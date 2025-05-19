import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { ResponseDto } from "../../utils/dto/response.dto";

export class UploadDto {
    @ApiProperty({
        example: "Title",
        required: false
    })
    @IsString()
    title: string;

    @ApiProperty({
        example: "Description",
        required: false
    })
    @IsString()
    description: string;
}

export class UploadResponseDto extends ResponseDto {
    @ApiProperty({ example: 201, description: 'HTTP status code' })
    statusCode: number;

    @ApiProperty({ description: 'File id and upload status', example: { fileId: "file_1_1747636780619.txt", status: "uploaded" } })
    data: any;

    @ApiProperty({ example: 'File upload successfull', description: 'Response message' })
    message: string;
}