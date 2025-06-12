import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {CreatePostDto} from "../models/createPostDto";
import {PostsService} from "./posts.service";
import {RawResponse} from "../utils/RawResponse"

// nest g co posts
@Controller('posts')
@ApiTags('NormalPosts') // Swagger 中控制器标签
export class PostsController {
    constructor(private readonly postService: PostsService) {
    }


    @Get('posts')
    @ApiOperation({summary: '显示列表'})
    async posts() {
        return await this.postService.findAll();
    }

    @Post()
    @ApiOperation({summary: '创建'})
    async create(@Body() dto: CreatePostDto) {
        return await this.postService.create(dto);
    }

    @Get(':id')
    @ApiOperation({summary: '详情'})
    detail(@Param('id') id: string) {
        return {
            id: id
        }
    }

    @Put(':id')
    @ApiOperation({summary: '编辑'})
    update(@Param('id') id: string, @Body() body: CreatePostDto) {
        return {
            id: id,
            success: true,
            body
        }
    }

    @RawResponse()
    @Delete(':id')
    @ApiOperation({summary: '删除'})
    remover(@Param('id') id: string) {
        return {
            id: id
        }
    }
}
