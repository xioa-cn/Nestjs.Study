import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm'

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '123456',
            database: 'nestjs_demo',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // 开发环境使用，生产环境建议关闭
        })
    ],
})
export class EntitiesModule {
}
