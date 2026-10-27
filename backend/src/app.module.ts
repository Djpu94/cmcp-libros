import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { BooksModule } from './books/books.module.js';
import { CommonModule } from './common/common.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [CommonModule, PrismaModule, AuthModule, BooksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
