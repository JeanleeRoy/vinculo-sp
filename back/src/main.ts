import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  const port = appConfig?.port ?? 3000;

  // OWASP A05: Helmet HTTP security headers (X-Frame-Options, CSP, HSTS, etc.)
  app.use(helmet());

  // OWASP A01 & A07: CORS restriction
  app.enableCors({
    origin: appConfig?.corsOrigin === '*' ? true : appConfig?.corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // OWASP A03: Strict input validation and sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OWASP A05: Global exception filter preventing error/stack trace leakage
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`Vinculo backend application running on port ${port}`);
}

bootstrap();
