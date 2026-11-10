import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { AppModule } from './app.module';
import { EmptyBodyHttpFilter } from './common/empty-body.filter';

function listenHost(): string {
  return process.env.MOCK_HOST ?? '127.0.0.1';
}

function listenPort(): number {
  for (const name of ['PORT', 'MOCK_PORT']) {
    const raw = process.env[name];
    if (raw) {
      return Number(raw);
    }
  }
  return 8081;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.useGlobalFilters(new EmptyBodyHttpFilter());
  app.use(json({ limit: '64kb' }));

  const swagger = new DocumentBuilder()
    .setTitle('Mock Seguros Bolívar · Magneto · Rankmi')
    .setDescription(
      'Mock HTTP de carga masiva, consulta y alta. Autenticación Bearer en los endpoints de negocio.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        description: 'Valor de MOCK_TOKEN (local: mock-seguros-local)',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('', app, document, {
    customSiteTitle: 'Mock Seguros Bolívar',
  });

  const host = listenHost();
  const port = listenPort();
  await app.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`Mock disponible en http://${host}:${port} (Swagger en /)`);
}

void bootstrap();
