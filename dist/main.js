"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const filters_1 = require("./common/filters");
const interceptors_1 = require("./common/interceptors");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.setGlobalPrefix('api');
    const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');
    app.enableCors({
        origin: corsOrigin.split(',').map(o => o.trim()),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new filters_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new interceptors_1.TransformInterceptor());
    const port = configService.get('PORT', 3001);
    await app.listen(port);
    logger.log(`Application running on: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map