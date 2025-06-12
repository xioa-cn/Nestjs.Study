import {Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
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

    @Get('getTitle')
    @ApiOperation({summary: '标题查询'})
    async findTitleEntity(@Query('title') title: string) {
        return await this.postService.findTitle(title);
    }

    @Get('getInfoById')
    @ApiOperation({summary: '通过id查询'})
    async findInfoById(@Query('id') id: number) {
        return await this.postService.findInfoByID(id);
    }

    @Post()
    @ApiOperation({summary: '创建'})
    async create(@Body() dto: CreatePostDto) {
        return await this.postService.create(dto);
    }

    @Get('largeId')
    @ApiOperation({summary: '查找id大于等于的信息'})
    async findInfoLargeById(@Query('id') id: number) {
        return await this.postService.findInfoLargeById(id);
    }

    @Get('smallId')
    @ApiOperation({summary: '小于id的信息'})
    async findInfoSmallById(@Query('id') id: number) {
        return await this.postService.findInfoSmallById(id);
    }

    @Get('findslIdInfo')
    @ApiOperation({summary: '大于s小于l的信息'})
    async findSlInfo(@Query('sid') sid: number, @Query('lid') lid: number) {
        return await this.postService.findInfo(sid, lid);
    }

    @Get(':id')
    @ApiOperation({summary: '详情'})
    detail(@Param('id')
               id: string
    ) {
        return {
            id: id
        }
    }

    @Put(':id')
    @ApiOperation({summary: '编辑'})
    update(@Param('id')
               id: string, @Body()
               body: CreatePostDto
    ) {
        return {
            id: id,
            success: true,
            body
        }
    }

    @RawResponse()
    @Delete(':id')
    @ApiOperation({summary: '删除'})
    remover(@Param('id')
                id: string
    ) {
        return {
            id: id
        }
    }
}
