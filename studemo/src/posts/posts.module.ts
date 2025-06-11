import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
// nest g mo posts
@Module({
  controllers: [PostsController]
})
export class PostsModule {}
