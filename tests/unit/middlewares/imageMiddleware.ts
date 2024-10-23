import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import {imageMiddleware} from '../../../src/shared/middlewares/image.middleware';
import { BadException, InternalServerErrorException } from '../../../src/shared/errors';

describe('ImageMiddleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: sinon.SinonSpy;

    beforeEach(() => {
        mockReq = {
            headers: {},
            body: {},
        };
        mockRes = {};
        mockNext = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Basic Validation', () => {
        it('should throw InternalServerErrorException when next is not provided', () => {
            expect(() => {
                imageMiddleware(mockReq as Request, mockRes as Response, undefined as any);
            }).to.throw(InternalServerErrorException);
        });

        it('should throw BadException when cover_image is in body but content-type is not multipart', () => {
            mockReq.body = { cover_image: 'some-image-data' };
            mockReq.headers = { 'content-type': 'application/json' };

            expect(() => {
                imageMiddleware(mockReq as Request, mockRes as Response, mockNext);
            }).to.throw(BadException, 'Content-Type must be multipart/form-data');
        });

        it('should call next() when no cover_image in body', () => {
            mockReq.headers = { 'content-type': 'application/json' };

            imageMiddleware(mockReq as Request, mockRes as Response, mockNext);

            sinon.assert.calledOnce(mockNext);
            sinon.assert.calledWithExactly(mockNext);
        });
    });


    describe('Content-Type Handling', () => {
        it('should process request without content-type header', () => {
            imageMiddleware(mockReq as Request, mockRes as Response, mockNext);

            sinon.assert.calledOnce(mockNext);
            sinon.assert.calledWithExactly(mockNext);
        });

        it('should handle various content-type formats', () => {
            const contentTypes = [
                'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
                'multipart/form-data;boundary=something',
                'multipart/form-data',
            ];

            contentTypes.forEach((contentType) => {
                mockReq.headers = { 'content-type': contentType };
                imageMiddleware(mockReq as Request, mockRes as Response, mockNext);
                expect(mockNext.called).to.be.true;
            });
        });
    });
});
