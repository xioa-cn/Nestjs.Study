import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {CreatePostDto} from "../models/createPostDto";

// nest g co posts
@Controller('posts')
@ApiTags('NormalPosts') // Swagger 中控制器标签
export class PostsController {
    @Get('posts')
    @ApiOperation({summary: '显示列表'})
    posts() {
        return "normal-text";
    }

    @Post()
    @ApiOperation({summary: '创建'})
    create(@Body() dto: CreatePostDto) {
        return dto;
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

    @Delete(':id')
    @ApiOperation({summary: '删除'})
    remover(@Param('id') id: string) {
        return {
            id: id
        }
    }
}
