import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import Joi from 'joi';
import {
  RequestBodyValidatorMiddleware,
  RequestQueryValidatorMiddleware,
  RequestParamsValidatorMiddleware,
  CombinedValidatorMiddleware
} from '../../../src/shared/middlewares/request-validator.middleware'
import { BadException } from '../../../src/shared/errors/index';

describe('Validation Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let nextFunction: sinon.SinonSpy;
  
  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      is: sinon.stub().returns(false)
    };
    res = {};
    nextFunction = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('RequestBodyValidatorMiddleware', () => {
    const validationSchema = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email().required()
    });

    it('should pass validation with valid body data', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const middleware = RequestBodyValidatorMiddleware(validationSchema);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args).to.have.lengthOf(0);
    });

    it('should fail validation with invalid body data', async () => {
      req.body = {
        username: 'testuser',
        email: 'invalid-email'
      };

      const middleware = RequestBodyValidatorMiddleware(validationSchema);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args[0]).to.be.instanceOf(BadException);
      expect(nextFunction.firstCall.args[0].message).to.include('"email" must be a valid email');
    });

    it('should handle existence checks correctly', async () => {
      req.body = {
        username: 'existinguser',
        email: 'test@example.com'
      };

      const userExistsValidator = sinon.stub().resolves(true);
      const existenceChecks = [{
        field: 'username',
        validator: userExistsValidator,
        errorMessage: 'User does not exist'
      }];

      const middleware = RequestBodyValidatorMiddleware(validationSchema, existenceChecks);
      await middleware(req as Request, res as Response, nextFunction);

      expect(userExistsValidator.calledOnce).to.be.true;
      expect(userExistsValidator.calledWith('existinguser')).to.be.true;
      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args).to.have.lengthOf(0);
    });

    it('should fail when existence check fails', async () => {
      req.body = {
        username: 'nonexistentuser',
        email: 'test@example.com'
      };

      const userExistsValidator = sinon.stub().resolves(false);
      const existenceChecks = [{
        field: 'username',
        validator: userExistsValidator,
        errorMessage: 'User does not exist'
      }];

      const middleware = RequestBodyValidatorMiddleware(validationSchema, existenceChecks);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args[0]).to.be.instanceOf(BadException);
      expect(nextFunction.firstCall.args[0].message).to.equal('User does not exist');
    });
  });

  describe('CombinedValidatorMiddleware', () => {
    const schemas = {
      body: Joi.object({
        name: Joi.string().required()
      }),
      query: Joi.object({
        filter: Joi.string().valid('active', 'inactive')
      }),
      params: Joi.object({
        id: Joi.number().required()
      })
    };

    it('should validate all parts of the request successfully', async () => {
      req.body = { name: 'Test User' };
      req.query = { filter: 'active' };
      req.params = { id: '1' };

      const middleware = CombinedValidatorMiddleware(schemas);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args).to.have.lengthOf(0);
    });

    it('should fail if any part of the request is invalid', async () => {
      req.body = { name: 'Test User' };
      req.query = { filter: 'invalid' }; 
      req.params = { id: '1' };

      const middleware = CombinedValidatorMiddleware(schemas);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args[0]).to.be.instanceOf(BadException);
      expect(nextFunction.firstCall.args[0].message).to.include('"filter" must be one of [active, inactive]');
    });

    it('should handle file uploads with correct content type', async () => {
      req.body = { name: 'Test User' };
      req.file = {} as Express.Multer.File;
      (req.is as sinon.SinonStub).returns(true);

      const middleware = CombinedValidatorMiddleware(schemas);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args).to.have.lengthOf(1);
    });


    it('should handle complex existence checks across different request parts', async () => {
      req.body = { name: 'Test User' };
      req.query = { filter: 'active' };
      req.params = { id: '1' };

      const existenceChecks = {
        body: [{
          field: 'name',
          validator: sinon.stub().resolves(true),
          errorMessage: 'Name already exists'
        }],
        params: [{
          field: 'id',
          validator: sinon.stub().resolves(true),
          errorMessage: 'ID not found'
        }],
        query: [{
          field: 'filter',
          validator: sinon.stub().resolves(true),
          errorMessage: 'Filter not found'
        }]
      };

      const middleware = CombinedValidatorMiddleware(schemas, existenceChecks);
      await middleware(req as Request, res as Response, nextFunction);

      expect(existenceChecks.body[0].validator.calledOnce).to.be.true;
      expect(existenceChecks.params[0].validator.calledOnce).to.be.true;
      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args).to.have.lengthOf(0);
    });
  });

  describe('RequestQueryValidatorMiddleware', () => {
    const querySchema = Joi.object({
      page: Joi.number().min(1),
      limit: Joi.number().min(1).max(100)
    });

    it('should validate query parameters successfully', async () => {
      req.query = {
        page: '1',
        limit: '10'
      };

      const middleware = RequestQueryValidatorMiddleware(querySchema);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args).to.have.lengthOf(0);
    });

    it('should fail with invalid query parameters', async () => {
      req.query = {
        page: '0',  // Invalid: below minimum
        limit: '10'
      };

      const middleware = RequestQueryValidatorMiddleware(querySchema);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args[0]).to.be.instanceOf(BadException);
      expect(nextFunction.firstCall.args[0].message).to.include('"page" must be greater than or equal to 1');
    });
  });

  describe('RequestParamsValidatorMiddleware', () => {
    const paramsSchema = Joi.object({
      id: Joi.number().required(),
      slug: Joi.string().required()
    });

    it('should validate URL parameters successfully', async () => {
      req.params = {
        id: '123',
        slug: 'test-slug'
      };

      const middleware = RequestParamsValidatorMiddleware(paramsSchema);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args).to.have.lengthOf(0);
    });

    it('should fail with missing required parameters', async () => {
      req.params = {
        id: '123'
      };

      const middleware = RequestParamsValidatorMiddleware(paramsSchema);
      await middleware(req as Request, res as Response, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
      expect(nextFunction.firstCall.args[0]).to.be.instanceOf(BadException);
      expect(nextFunction.firstCall.args[0].message).to.include('"slug" is required');
    });
  });
});