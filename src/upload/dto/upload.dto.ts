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

    @ApiProperty({ description: 'File id and upload status', example: { fileId: "1", status: "uploaded" } })
    data: any;

    @ApiProperty({ example: 'File upload successfull', description: 'Response message' })
    message: string;
}

export class FileStatusResponseDto extends ResponseDto {
    @ApiProperty({
        description: 'File id and upload status',
        example: {
            status: "uploaded",
            originalFilename: "filename.txt",
            title: "Title",
            description: "Description",
            storagePath: "1/file_1_1747636780619.txt",
            extractedData: ""
        }
    })
    data: any;

    @ApiProperty({ example: 'File status', description: 'Response message' })
    message: string;
}