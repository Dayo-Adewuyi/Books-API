import { Router } from 'express';
import bookController from './controller';
import { WatchAsyncController } from '../../shared/utils/watch-async-controller';
import {
  bookQuerySchema, bookIdSchema, updateBookSchema, createBookSchema,
  buyBookSchema,
  userIdSchema,
  checkUserId,
  checkBookId
} from "./validator"
import { RequestBodyValidatorMiddleware , RequestParamsValidatorMiddleware, RequestQueryValidatorMiddleware, CombinedValidatorMiddleware} from '../../shared/middlewares/request-validator.middleware';
import { imageMiddleware } from '../../shared/middlewares/image.middleware';

const bookRouter = Router();

bookRouter.post(
  '/',
  imageMiddleware,
  RequestBodyValidatorMiddleware(createBookSchema),
  WatchAsyncController(bookController.createBook),
);

bookRouter.get(
  '/',
  RequestQueryValidatorMiddleware(bookQuerySchema),
  WatchAsyncController(bookController.fetchAllBooks)
)

bookRouter.get(
  '/:bookId',
  RequestParamsValidatorMiddleware(bookIdSchema,[checkBookId]),
  WatchAsyncController(bookController.fetchBook)
)

bookRouter.put(
  '/:bookId',
  imageMiddleware,
  CombinedValidatorMiddleware({
    body: updateBookSchema,
    params: bookIdSchema 
  }, 
    { params: [checkBookId],body: [] ,query: []}
  ),
  WatchAsyncController(bookController.updateBook)
)

bookRouter.delete(
  '/:bookId',
  RequestParamsValidatorMiddleware(bookIdSchema,[checkBookId]),
  WatchAsyncController(bookController.deleteBook)
)

bookRouter.post(
  '/buy/:bookId',
  CombinedValidatorMiddleware({
    body: buyBookSchema,
    params: bookIdSchema
  },{ params: [checkBookId],body: [] ,query: []}),
  WatchAsyncController(bookController.buyBook)
)

bookRouter.get(
  '/transactions/:userId',
  CombinedValidatorMiddleware({
    params: userIdSchema,
    query: bookQuerySchema
    },{ params: [checkUserId],body: [] ,query: []}),
  WatchAsyncController(bookController.fetchUserPurchase)
)

export default bookRouter;
