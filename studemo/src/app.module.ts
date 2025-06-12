import {Module} from '@nestjs/common';
import {PostsModule} from './posts/posts.module';
import {EntitiesModule} from './entities/entities.module';
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ResponseInterceptor} from "./utils/ResponseInterceptor";

@Module({
    imports: [EntitiesModule, PostsModule],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
    ],
})
export class AppModule {
}
