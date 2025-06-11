import {INestApplication} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

// pnpm add --save @nestjs/swagger swagger-ui-express
export function useSwagger(app: INestApplication) {
    const options = new DocumentBuilder()
        .setTitle("Stu.Demo.Api")
        .setDescription("Description")
        .setVersion("1.0")
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-docs', app, document);
}