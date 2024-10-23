import Joi from 'joi';
import AuthServices from '../authentication/services';
import BookServices from './services';
import { ExistenceCheck } from '../../shared/middlewares/request-validator.middleware';
import { NotFoundException } from '../../shared/errors';

export const createBookSchema = Joi.object({
    title: Joi.string().required().trim(),
    authors: Joi.array<string[]>().required(),
    publisher: Joi.string().required().trim(),
    published: Joi.date().required(),
    genre: Joi.array<string>().required(),
    summary: Joi.string().trim(),
    price: Joi.number().positive(),
    coverImage: Joi.any()
});

export const updateBookSchema = Joi.object({
    title: Joi.string().trim(),
    authors: Joi.array<string[]>(),
    publisher: Joi.string().trim(),
    published: Joi.date(),
    genre: Joi.array<string>(),
    summary: Joi.string().trim(),
    price:Joi.number().positive()
})

export const bookIdSchema = Joi.object({
    bookId: Joi.string().guid({ version: 'uuidv4' })
})

export const userIdSchema = Joi.object({
    userId: Joi.string().guid({ version: 'uuidv4' }).required()
})

export const bookQuerySchema = Joi.object({
    limit: Joi.number().integer().min(1).default(10),
    offset: Joi.number().integer().min(0).default(0),
    genre: Joi.string().optional(),
    author: Joi.string().optional()
});

export const buyBookSchema = Joi.object({
    quantity: Joi.number().integer().min(1).default(1).required()
})

export const checkUserId : ExistenceCheck = {
    field: 'userId',
    validator: async (userId: string) => {
      try {
        const user = await AuthServices.getUser(userId);
        if(user instanceof NotFoundException){
            return false;
        }
        return !!user;
      } catch (error) {
        return false;
      }
    },
    errorMessage: 'User not found'
  }; 

  export const checkBookId : ExistenceCheck = {
    field: 'bookId',
    validator: async (bookId: string) => {
      try {
        const book = await BookServices.fetchBook(bookId);
        if(book instanceof NotFoundException){
            return false;
        }
        return !!book;
      } catch (error) {
        return false;
      }
    },
    errorMessage: 'Book not found'
  };

