import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file before anything else
config({ path: resolve(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('🚀 Starting Vision Clinic Backend...');
    console.log('💾 Database: MySQL (Prisma)');
    console.log('📝 Make sure MySQL is running and DATABASE_URL is set in your .env file');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    // Enable CORS for offline operation and Flutter web
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or Flutter web)
        if (!origin) {
          return callback(null, true);
        }
        // Allow localhost from any port (for Flutter web and other local dev)
        const allowedOrigins = [
          /^http:\/\/localhost:\d+$/,
          /^http:\/\/127\.0\.0\.1:\d+$/,
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
        ];
        
        const isAllowed = allowedOrigins.some(allowed => {
          if (typeof allowed === 'string') {
            return origin === allowed;
          } else {
            return allowed.test(origin);
          }
        });
        
        callback(null, isAllowed);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // Enable validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`✅ Application is running on: http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🌐 CORS enabled for: http://localhost:3000`);
    console.log(`💾 Database: MySQL via Prisma`);
  } catch (error: any) {
    // Check if it's a database connection error
    if (error.message && (error.message.includes('P1001') || error.message.includes('ECONNREFUSED') || error.message.includes('database'))) {
      console.error('\n❌ Database Connection Error:');
      console.error('   MySQL is not running or not accessible.');
      console.error('   To fix this:');
      console.error('   1. Make sure MySQL is installed and running');
      console.error('   2. Set DATABASE_URL in your .env file:');
      console.error('      DATABASE_URL="mysql://user:password@localhost:3306/vision_clinic"');
      console.error('   3. Run migrations: npm run prisma:migrate');
      console.error('   4. Generate Prisma client: npm run prisma:generate\n');
    }
    console.error('❌ Server startup error:', error.message);
    if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
