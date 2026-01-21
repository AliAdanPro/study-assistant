import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { GeminiService } from './gemini.service';  

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService,GeminiService], 
})
export class DocumentsModule {}