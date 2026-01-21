import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
  constructor(private configService: ConfigService) {}

  async generateFlashcards(
    text: string,
  ): Promise<{ question: string; answer: string; difficulty?: string }[]> {
    const MODEL = 'models/gemini-2.5-flash';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent`;
    const GEMINI_API_KEY = this.configService.get<string>('GEMINI_API_KEY');
    const prompt = `Generate 10 flashcards from the following document. Each flashcard should be a JSON object with 'question', 'answer', and 'difficulty' (EASY, MEDIUM, HARD). Return a JSON array.\n\nDocument:\n${text}`;
    try {
      const res = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        contents: [{ parts: [{ text: prompt }] }],
      });
      const data = (res.data as any) || {};
      const raw =
        Array.isArray(data.candidates) &&
        data.candidates[0]?.content?.parts?.[0]?.text
          ? data.candidates[0].content.parts[0].text.trim()
          : '';
      let flashcards: Array<{
        question: string;
        answer: string;
        difficulty?: string;
      }> = [];
      try {
       
        const json = raw.replace(/^```json|```$/g, '').trim();
        flashcards = JSON.parse(json);
      } catch (err) {
        console.error('Failed to parse flashcards JSON:', err, raw);
        flashcards = [];
      }
      if (!Array.isArray(flashcards)) return [];
      return flashcards;
    } catch (err) {
      console.error(
        'Gemini flashcard error:',
        err?.response?.data || err.message || err,
      );
      return [];
    }
  }

  private formatResponse(answer: string): string {
   
    const codeBlockMatch = answer.match(/```(?:\w*\n)?([\s\S]*?)```/);
    if (codeBlockMatch) {
     
      return `\`\`\`\n${codeBlockMatch[1].trim()}\n\`\`\``;
    }
   
    const codePattern =
      /(?:class |function |const |let |var |def |#include |import )/i;
    if (codePattern.test(answer)) {
      return `\`\`\`\n${answer.trim()}\n\`\`\``;
    }
    
    return `**Answer:**\n\n${answer.trim()}`;
  }
  async summarize(text: string): Promise<string> {
    if (!text || !text.trim()) return 'No text found in document.';
    const MODEL = 'models/gemini-2.5-flash';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent`;
    const GEMINI_API_KEY = this.configService.get<string>('GEMINI_API_KEY');
    const prompt = `Summarize the following document:\n\n${text}`;
    try {
      const res = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        contents: [{ parts: [{ text: prompt }] }],
      });
      const data = (res.data as any) || {};
      const summary =
        Array.isArray(data.candidates) &&
        data.candidates[0]?.content?.parts?.[0]?.text
          ? data.candidates[0].content.parts[0].text.trim()
          : undefined;
      return summary || 'No summary generated.';
    } catch (err) {
      console.error(
        'Gemini summary error:',
        err?.response?.data || err.message || err,
      );
      return 'Failed to generate summary.';
    }
  }
  async askGemini(question: string, documentText: string): Promise<string> {
   
    const MODEL = 'models/gemini-2.5-flash'; 
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent`;

    const GEMINI_API_KEY = this.configService.get<string>('GEMINI_API_KEY');

    const prompt = `You are an expert assistant. Answer the following question using ONLY the information from the provided document. If the answer cannot be found in the document, reply with "NOT_FOUND".

Document:
${documentText}

Question:
${question}
`;

    try {
      const res = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      });
      const data = (res.data as any) || {};
      const answer =
        Array.isArray(data.candidates) &&
        data.candidates[0]?.content?.parts?.[0]?.text
          ? data.candidates[0].content.parts[0].text.trim()
          : '';

     
      if (
        answer.toLowerCase().includes('not_found') ||
        answer.toLowerCase().includes('not found') ||
        answer.toLowerCase().includes('cannot be found') ||
        answer.toLowerCase().includes("i don't know")
      ) {
        const fallbackPrompt = `
You are an expert assistant. The user asked: "${question}"
Answer using your own knowledge base if possible. Format any code in markdown code blocks and ensure all responses are well formatted.
`;
        const fallbackRes = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [{ text: fallbackPrompt }],
              },
            ],
          },
        );
        const fallbackData = (fallbackRes.data as any) || {};
        const fallbackAnswer =
          Array.isArray(fallbackData.candidates) &&
          fallbackData.candidates[0]?.content?.parts?.[0]?.text
            ? fallbackData.candidates[0].content.parts[0].text.trim()
            : "Sorry, I couldn't get an answer.";
        return this.formatResponse(fallbackAnswer);
      }
      return this.formatResponse(answer || 'No answer found.');
    } catch (err) {
      console.error(
        'Gemini API error:',
        err?.response?.data || err.message || err,
      );
      return "**Sorry, I couldn't get an answer.**";
    }
  }
  async generateQuizQuestions(text: string, numQuestions: number) {
    const MODEL = 'models/gemini-2.5-flash';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent`;
    const GEMINI_API_KEY = this.configService.get<string>('GEMINI_API_KEY');
    const prompt = `
Generate ${numQuestions} multiple-choice questions (MCQs) from the following document. 
Each question should be a JSON object with:
- question: string
- options: array of 4 strings
- correct_option: index (0-3) of the correct option

Return a JSON array.

Document:
${text}
`;
    try {
      const res = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        contents: [{ parts: [{ text: prompt }] }],
      });
    
      const data = res.data as any;
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
     
      const json = raw.replace(/^```json|```$/g, '').trim();
      return JSON.parse(json);
    } catch (err) {
      console.error(
        'Gemini quiz error:',
        err?.response?.data || err.message || err,
      );
      return [];
    }
  }
}
