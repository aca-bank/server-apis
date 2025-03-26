import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { normalizeValidationErrors } from './filters/http-exception/utils';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        return new BadRequestException(normalizeValidationErrors(errors));
      },
    }),
  );
  app.use(helmet());
  // app.use(csurf());

  /**
   * Swagger
   */

  const config = new DocumentBuilder()
    .setTitle('ACA Bank')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('specs', app, document);

  await app.listen(process.env.PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
