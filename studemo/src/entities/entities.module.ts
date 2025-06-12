import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';

// pnpm add --save @nestjs/typeorm typeorm mysql2

// 定义数据库类型，与TypeORM兼容
type DatabaseType = 'mysql' | 'postgres' | 'sqlite' | 'mssql' | 'oracle';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: 'default',
            useFactory: (configService: ConfigService) => ({
                    type: configService.get('DB_TYPE', 'mysql'),
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 3306),
                    username: configService.get('DB_USERNAME', 'root'),
                    password: configService.get('DB_PASSWORD', '123456'),
                    database: configService.get('DB_DATABASE', 'nestjs_demo'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('DB_SYNCHRONIZE', true),
                }
            ) as any,
            inject: [ConfigService], // 关键点注入ConfigService以使用userFactory
        }),
        TypeOrmModule.forRootAsync({
            name: 'sec',
            useFactory: (configService: ConfigService) => ({
                type: configService.get('SECONDARY_DB_TYPE', 'mysql'),
                host: configService.get('SECONDARY_DB_HOST', 'localhost'),
                port: configService.get('SECONDARY_DB_PORT', 3306),
                username: configService.get('SECONDARY_DB_USERNAME', 'root'),
                password: configService.get('SECONDARY_DB_PASSWORD', '123456'),
                database: configService.get('SECONDARY_DB_DATABASE', 'nestjs_demo'),
                entities: [__dirname + '/**/*.entitySecond{.ts,.js}'],
                synchronize: configService.get('SECONDARY_DB_SYNCHRONIZE', true),
            })  as any,
            inject: [ConfigService],
        })
    ],
})
export class EntitiesModule {
}
