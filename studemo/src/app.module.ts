import {Module} from '@nestjs/common';
import {PostsModule} from './posts/posts.module';
import {EntitiesModule} from './entities/entities.module';
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ResponseInterceptor} from "./utils/ResponseInterceptor";
import {ConfigModule} from "@nestjs/config";
import { SettingsModule } from './settings/settings.module';

// pnpm add --save @nestjs/config
@Module({
    imports: [
        ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ['.env', '.env.development']
    }),
        EntitiesModule,
        PostsModule,
        SettingsModule],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
    ],
})
export class AppModule {
}
