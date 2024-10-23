import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Logger from '../../config/logger';
import { BadException } from '../errors';

/**
 * Request validation middleware
 * This middleware validates the request body, query, or params against a Joi schema.
 * It also checks for the existence of certain fields in the request.
 * If the request data does not pass validation, it throws a BadException.
 * If the existence check fails, it throws a BadException with a custom error message.
 * @param {ValidationType} validationType - The type of validation to perform (body, query, or params)
 * @param {Joi.ObjectSchema<T>} validationSchema - The Joi schema to validate the request data against
 * @param {ExistenceCheck[]} existenceChecks - An array of existence checks to perform on the request data 
 */

type ValidationType = 'body' | 'query' | 'params';

export interface ExistenceCheck {
  field: string;
  validator: (value: any) => Promise<boolean>;
  errorMessage?: string;
}

const validateRequest = <T>(
  validationType: ValidationType,
  validationSchema: Joi.ObjectSchema<T>,
  req: Request
): void => {
  const logger = new Logger(`Request${validationType.charAt(0).toUpperCase() + validationType.slice(1)}ValidatorMiddleware`);
  
  const dataToValidate = req[validationType];
  const validationResult = validationSchema.validate(dataToValidate);

  if (validationResult.error) {
    logger.log(validationResult.error);
    throw new BadException(validationResult.error.message);
  }
};

const createValidatorMiddleware = <T>(
  type: ValidationType,
  validationSchema: Joi.ObjectSchema<T>,
  existenceChecks?: ExistenceCheck[]
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      validateRequest(type, validationSchema, req);

      if (existenceChecks) {
        for (const check of existenceChecks) {
          const value = req[type][check.field];
          const exists = await check.validator(value);
          
          if (!exists) {
            throw new BadException(
              check.errorMessage || `${check.field} ${value} not found`
            );
          }
        }
      }

      if (type === 'body' && req.file && !req.is('multipart/form-data')) {
        throw new BadException('Content-Type must be multipart/form-data');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const RequestBodyValidatorMiddleware = <T>(
  validationSchema: Joi.ObjectSchema<T>,
  existenceChecks?: ExistenceCheck[]
) => createValidatorMiddleware('body', validationSchema, existenceChecks);

export const RequestQueryValidatorMiddleware = <T>(
  validationSchema: Joi.ObjectSchema<T>,
  existenceChecks?: ExistenceCheck[]
) => createValidatorMiddleware('query', validationSchema, existenceChecks);

export const RequestParamsValidatorMiddleware = <T>(
  validationSchema: Joi.ObjectSchema<T>,
  existenceChecks?: ExistenceCheck[]
) => createValidatorMiddleware('params', validationSchema, existenceChecks);

export interface ValidationSchemas<T> {
  body?: Joi.ObjectSchema<T>;
  query?: Joi.ObjectSchema<T>;
  params?: Joi.ObjectSchema<T>;
}

export const CombinedValidatorMiddleware = <T>(
  schemas: ValidationSchemas<T>,
  existenceChecks?: Record<ValidationType, ExistenceCheck[]>
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        validateRequest('body', schemas.body, req);
        if (existenceChecks?.body) {
          for (const check of existenceChecks.body) {
            const exists = await check.validator(req.body[check.field]);
            if (!exists) {
              throw new BadException(
                check.errorMessage || `${check.field} ${req.body[check.field]} not found`
              );
            }
          }
        }
      }

      if (schemas.query) {
        validateRequest('query', schemas.query, req);
        if (existenceChecks?.query) {
          for (const check of existenceChecks.query) {
            const exists = await check.validator(req.query[check.field]);
            if (!exists) {
              throw new BadException(
                check.errorMessage || `${check.field} ${req.query[check.field]} not found`
              );
            }
          }
        }
      }

      if (schemas.params) {
        validateRequest('params', schemas.params, req);
        if (existenceChecks?.params) {
          for (const check of existenceChecks.params) {
            const exists = await check.validator(req.params[check.field]);
            if (!exists) {
              throw new BadException(
                check.errorMessage || `${check.field} ${req.params[check.field]} not found`
              );
            }
          }
        }
      }

      if (req.file && !req.is('multipart/form-data')) {
        throw new BadException('Content-Type must be multipart/form-data');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};