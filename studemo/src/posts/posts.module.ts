import {Module} from '@nestjs/common';
import {PostsController} from './posts.controller';
import {PostsService} from "./posts.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Posts} from "../entities/model/posts.entity";

// nest g mo posts
@Module({
    imports: [TypeOrmModule.forFeature([Posts],'default')],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService]
})
export class PostsModule {
}
