import { Router } from 'express';
import authController from './controller';
import * as validators from './validator';
import { WatchAsyncController } from '../../shared/utils/watch-async-controller';
import { RequestBodyValidatorMiddleware } from '../../shared/middlewares/request-validator.middleware';

const authRouter = Router();

authRouter.post(
  '/register',
  RequestBodyValidatorMiddleware(validators.registerSchema),
  WatchAsyncController(authController.createUser),
);



authRouter.post(
  '/login',
  RequestBodyValidatorMiddleware(validators.loginSchema),
  WatchAsyncController(authController.login),
)

export default authRouter;
