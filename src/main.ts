import { AdminModule } from '@/admin/admin.module';
import { AppModule } from '@/app.module';
import { AuthModule } from '@/auth/auth.module';
import { BuyerModule } from '@/buyer/buyer.module';
import { SupplierModule } from '@/supplier/supplier.module';
import { AllExceptionsFilter } from '@/utils/filters/all-exceptions.filter';
import { LoggerInterceptor } from '@/utils/interceptors/logger.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  if (app.get(ConfigService).get('NODE_ENV') !== 'production') {
    // apply logs to each request use basic console.log
    app.useGlobalInterceptors(new LoggerInterceptor());
  }
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  //#region Admin API Documentation
  const adminConfig = new DocumentBuilder()
    .setTitle('Buy4You Admin API')
    .setDescription('API documentation for Buy4You administrators. Admins manage all aspects of the system, including users, orders, subscriptions, and settings.')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'admin-api-key', in: 'header' }, 'admin-api-key')
    .addTag('admin')
    .build();

  const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
    include: [AdminModule, AuthModule],
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup('api/admin', app, adminDocument);

  app.use(
    '/reference/admin',
    apiReference({
      spec: {
        content: adminDocument,
      },
      theme: 'purple',
      cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest',
    }),
  );
  //#endregion

  //#region Buyer API Documentation
  const buyerConfig = new DocumentBuilder()
    .setTitle('Buy4You Buyer API')
    .setDescription('API documentation for Buy4You buyers. Buyers can create orders, manage their profiles, and track order status.')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'buyer-api-key', in: 'header' }, 'buyer-api-key')
    .addTag('buyer')
    .build();

  const buyerDocument = SwaggerModule.createDocument(app, buyerConfig, {
    include: [BuyerModule, AuthModule],
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup('api/buyer', app, buyerDocument);

  app.use(
    '/reference/buyer',
    apiReference({
      spec: {
        content: buyerDocument,
      },
      theme: 'purple',
      cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest',
    }),
  );
  //#endregion

  //#region Supplier API Documentation
  const supplierConfig = new DocumentBuilder()
    .setTitle('Buy4You Supplier API')
    .setDescription('API documentation for Buy4You suppliers. Suppliers receive order notifications, submit quotations, and manage their profiles.')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'supplier-api-key', in: 'header' }, 'supplier-api-key')
    .addTag('supplier')
    .build();

  const supplierDocument = SwaggerModule.createDocument(app, supplierConfig, {
    include: [SupplierModule, AuthModule],
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup('api/supplier', app, supplierDocument);

  app.use(
    '/reference/supplier',
    apiReference({
      spec: {
        content: supplierDocument,
      },
      theme: 'purple',
      cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest',
    }),
  );
  //#endregion

  //#region Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Buy4You API')
    .setDescription('The Buy4You API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  //#endregion

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
