import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());

  app.enableCors({
    origin: config.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-workspace-id',
      'x-csrf-token',
    ],
  });

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`GraphQL API running on http://localhost:${port}/graphql`);
}

bootstrap();
