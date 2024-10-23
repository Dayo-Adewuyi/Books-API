import express from 'express';
import booksRouter from '../../modules/books/routes';
import authRouter from '../../modules/authentication/routes';
import authMiddleware from '../../shared/middlewares/auth.middleware';

const appRouter = express.Router();

appRouter.use('/user', authRouter);
appRouter.use('/books', authMiddleware, booksRouter);

export const Router = appRouter;
