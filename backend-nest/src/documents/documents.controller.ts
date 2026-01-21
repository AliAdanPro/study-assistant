import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Get,
  Delete,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { DocumentsService } from './documents.service';
import { GeminiService } from './gemini.service';

@Controller('api/documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly geminiService: GeminiService,
  ) {}

  @Get()
  async findAll(@Query('userId') userId?: string) {
    if (userId) {
      return await this.documentsService.getDocumentsByUserId(Number(userId));
    }
    return await this.documentsService.getAllDocuments();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(null, false);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadFile(@UploadedFile() file: any, @Body() body: any) {
    if (!file) {
      return { error: 'Invalid file type or no file uploaded' };
    }

    const absolutePath = require('path').resolve(file.path);
    const doc = await this.documentsService.saveDocument({
      user_id: body.user_id || 1,
      title: body.title || file.originalname,
      filename: file.filename,
      filesize: file.size,
      filepath: absolutePath,
    });
    return { success: true, document: doc };
  }

  @Get('stats/:userId')
  async getStats(@Param('userId') userId: string) {
    const documents = await this.documentsService.countDocuments(
      Number(userId),
    );
    const flashcards = await this.documentsService.countFlashcards(
      Number(userId),
    );
    const quizzes = await this.documentsService.countQuizzes(Number(userId));
    return { documents, flashcards, quizzes };
  }

  @Get('activity/:userId')
  async getActivity(@Param('userId') userId: string) {
    return {
      activities: await this.documentsService.getRecentActivity(Number(userId)),
    };
  }

  @Get('analytics/:userId')
  async getAnalytics(@Param('userId') userId: string) {
    return this.documentsService.getAnalytics(Number(userId));
  }

  @Get('flashcards/:setId')
  async getFlashcards(@Param('setId') setId: string) {
    return {
      flashcards: await this.documentsService.getFlashcards(Number(setId)),
    };
  }

  @Delete('flashcards/:setId')
  async deleteFlashcardSet(@Param('setId') setId: string) {
    const result = await this.documentsService.deleteFlashcardSet(
      Number(setId),
    );
    return { success: result };
  }

  @Get('quizzes/:quizId/questions')
  async getQuizQuestions(@Param('quizId') quizId: string) {
    const questions = await this.documentsService.getQuizQuestions(
      Number(quizId),
    );
    return { questions };
  }

  @Post('quizzes/:quizId/submit')
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Body('answers') answers: number[],
    @Body('userId') userId: number,
  ) {
    const result = await this.documentsService.submitQuiz(
      Number(quizId),
      answers,
    );
    await this.documentsService.logActivity({
      userId,
      type: 'quiz_attempt',
      quizId: Number(quizId),
    });
    return result;
  }

  @Delete('quizzes/:quizId')
  async deleteQuiz(@Param('quizId') quizId: string) {
    const result = await this.documentsService.deleteQuiz(Number(quizId));
    return { success: result };
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    const result = await this.documentsService.deleteDocument(Number(id));
    return { success: result };
  }

  @Post(':id/chat')
  async chatWithDocument(
    @Param('id') id: string,
    @Body('question') question: string,
    @Body('documentText') documentText?: string,
  ) {
    let docText = documentText;
    if (!docText) {
      const doc = await this.documentsService.getDocumentById(Number(id));
      if (doc && doc.filepath) {
        docText = await this.documentsService.extractTextFromPdf(doc.filepath);
      } else {
        docText = '';
      }
    }
    const answer = await this.geminiService.askGemini(question, docText || '');
    return { answer };
  }

  @Post(':id/summary')
  async summarizeDocument(@Param('id') id: string) {
    try {
      console.log('[summarizeDocument] (TOP) Called for document id:', id);
      const doc = await this.documentsService.getDocumentById(Number(id));
      console.log('[summarizeDocument] Document from DB:', doc);
      if (!doc || !doc.filepath) {
        console.error(
          '[summarizeDocument] Document not found or missing filepath for id:',
          id,
        );
        throw new NotFoundException('Document not found');
      }
      const docText = await this.documentsService.extractTextFromPdf(
        doc.filepath,
      );
      const summary = await this.geminiService.summarize(docText);
      return { summary };
    } catch (err) {
      console.error('[summarizeDocument] ERROR:', err);
      throw err;
    }
  }

  @Post(':id/flashcards/generate')
  async generateFlashcardSet(@Param('id') id: string) {
    const doc = await this.documentsService.getDocumentById(Number(id));
    const docText = await this.documentsService.extractTextFromPdf(
      doc.filepath,
    );
    const flashcards = await this.geminiService.generateFlashcards(docText);
    const setId = await this.documentsService.createFlashcardSet(
      Number(id),
      flashcards,
    );
    return { setId };
  }

  @Get(':id/flashcards/sets')
  async getFlashcardSets(@Param('id') id: string) {
    return { sets: await this.documentsService.getFlashcardSets(Number(id)) };
  }

  @Post(':id/quizzes/generate')
  async generateQuiz(
    @Param('id') id: string,
    @Body('numQuestions') numQuestions: number,
  ) {
    const quiz = await this.documentsService.generateQuiz(
      Number(id),
      numQuestions,
    );
    return { quiz };
  }

  @Get(':id/quizzes')
  async getQuizzes(@Param('id') id: string) {
    const docId = Number(id);
    if (isNaN(docId)) {
      throw new BadRequestException('Invalid document id');
    }
    const quizzes = await this.documentsService.getQuizzes(docId);
    return { quizzes };
  }

  @Post(':id/access')
  async logDocumentAccess(
    @Param('id') id: string,
    @Body('userId') userId: number,
  ) {
    await this.documentsService.logActivity({
      userId,
      type: 'document_access',
      documentId: Number(id),
    });
    return { success: true };
  }

  @Post(':id/duration')
  async logDuration(
    @Param('id') id: string,
    @Body() body: { userId: number; durationMinutes: number },
  ) {
    return this.documentsService.logDuration(
      Number(id),
      body.userId,
      body.durationMinutes,
    );
  }
}
