import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { redisConfig } from './config/redis.config';
import { RpcExceptionFilter } from './shared/filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar microservicio Redis
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisConfig.host,
      port: redisConfig.port,
    },
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Enterprise Service API')
    .setDescription('API para la gestión de administradores, empresas y autenticación')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new RpcExceptionFilter()); // Filtro para manejar excepciones RPC

  // Iniciar microservicio y aplicación HTTP
  await app.startAllMicroservices();
  const port = process.env.PORT || 3001;
  await app.listen(port);
}
bootstrap();
