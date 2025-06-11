import {ApiProperty} from "@nestjs/swagger";

export class CreatePostDto {

    @ApiProperty({title: '标题'})
    title: string

    @ApiProperty({title: '内容'})
    content: string
}