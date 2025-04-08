import prisma from '../../db.server';
import { loggerService } from '../../lib/logger';
import type { QuoteNoteInput } from '~/types/quotes/quote-note.schema';

/**
 * Repository class for managing quote notes
 * Handles database operations for quote notes
 */
export class QuoteNoteRepository {
  /**
   * Create a new quote note
   */
  public async createQuoteNote(data: QuoteNoteInput) {
    try {
      const note = await prisma.quoteNote.create({
        data
      });

      loggerService.info('Quote note created successfully', {
        quoteId: data.quoteId,
        noteType: data.noteType
      });

      return note;
    } catch (error) {
      loggerService.error('Error creating quote note', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        data
      });
      throw error;
    }
  }

  /**
   * Get all notes for a quote
   */
  public async getQuoteNotes(quoteId: number) {
    try {
      const notes = await prisma.quoteNote.findMany({
        where: { quoteId },
        orderBy: { createdAt: 'desc' }
      });

      loggerService.info('Quote notes retrieved successfully', {
        quoteId,
        noteCount: notes.length
      });

      return notes;
    } catch (error) {
      loggerService.error('Error retrieving quote notes', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        quoteId
      });
      throw error;
    }
  }
}

export const quoteNoteRepository = new QuoteNoteRepository(); 