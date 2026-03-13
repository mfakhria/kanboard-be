"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("./app.module");
const filters_1 = require("./common/filters");
const interceptors_1 = require("./common/interceptors");
const express = require("express");
let cachedApp;
async function bootstrap() {
    const expressApp = express();
    const adapter = new platform_express_1.ExpressAdapter(expressApp);
    const app = await core_1.NestFactory.create(app_module_1.AppModule, adapter, { logger: false });
    app.setGlobalPrefix('api');
    const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
    app.enableCors({
        origin: corsOrigin.split(',').map((o) => o.trim()),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new filters_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new interceptors_1.TransformInterceptor());
    await app.init();
    return expressApp;
}
exports.default = async (req, res) => {
    const origin = req.headers.origin;
    const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim());
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else if (!origin) {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (!cachedApp) {
        cachedApp = await bootstrap();
    }
    return cachedApp(req, res);
};
//# sourceMappingURL=lambda.js.map