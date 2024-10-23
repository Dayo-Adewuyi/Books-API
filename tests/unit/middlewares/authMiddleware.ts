import sinon from 'sinon';
import { Request, Response } from 'express';
import { expect } from 'chai';
import authMiddleware from '../../../src/shared/middlewares/auth.middleware';
import hashingService from '../../../src/shared/services/hashing/hashing.service';
import AuthServices from '../../../src/modules/authentication/services';
import { NotFoundException, UnAuthorizedException } from '../../../src/shared/errors';

describe('AuthMiddleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: sinon.SinonSpy;
    let hashingStub: sinon.SinonStub;
    let getUserStub: sinon.SinonStub;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub(),
        };
        mockNext = sinon.spy();
        
        hashingStub = sinon.stub(hashingService, 'verify');
        getUserStub = sinon.stub(AuthServices, 'getUser');
    });

    afterEach(() => {
        sinon.restore(); 
    });

    it('should call next with UnAuthorizedException when auth header is missing', async () => {
        await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

        sinon.assert.calledOnce(mockNext);
        const error = mockNext.firstCall.args[0];
        expect(error).to.be.instanceOf(UnAuthorizedException);
        expect(error.message).to.equal('No authorization header provided');
    });

    it('should call next with UnAuthorizedException when token format is invalid', async () => {
        mockReq.headers = { authorization: 'invalid-token' };

        await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

        sinon.assert.calledOnce(mockNext);
        const error = mockNext.firstCall.args[0];
        expect(error).to.be.instanceOf(UnAuthorizedException);
        expect(error.message).to.equal('Invalid authorization header format');
    });

    it('should call next with UnAuthorizedException when token verification fails', async () => {
        mockReq.headers = { authorization: 'JWT some-token' };
        hashingStub.throws(new Error('Token verification failed'));

        await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

        sinon.assert.calledOnce(mockNext);
        const error = mockNext.firstCall.args[0];
        expect(error).to.be.instanceOf(UnAuthorizedException);
        expect(error.message).to.equal('Invalid or expired token');
    });

    it('should call next with UnAuthorizedException when token payload has no id', async () => {
        mockReq.headers = { authorization: 'JWT some-token' };
        hashingStub.returns({}); 

        await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

        sinon.assert.calledOnce(mockNext);
        const error = mockNext.firstCall.args[0];
        expect(error).to.be.instanceOf(UnAuthorizedException);
        expect(error.message).to.equal('Invalid or expired token');
    });

    it('should call next with UnAuthorizedException when user does not exist', async () => {
        mockReq.headers = { authorization: 'JWT some-token' };
        hashingStub.returns({ id: '1' });
        getUserStub.resolves(new NotFoundException('user does not exist'));

        await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

        sinon.assert.calledOnce(mockNext);
        const error = mockNext.firstCall.args[0];
        expect(error).to.be.instanceOf(UnAuthorizedException);
        expect(error.message).to.equal('Invalid or expired token');
    });

    it('should set user in request object and call next when authentication succeeds', async () => {
        const mockUser = { id: '1', username: 'testUser' };
        mockReq.headers = { authorization: 'JWT valid-token' };
        hashingStub.returns({ id: '1' });
        getUserStub.resolves(mockUser);

        await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.user).to.deep.equal(mockUser);
        sinon.assert.calledOnce(mockNext);
        sinon.assert.calledWithExactly(mockNext);
    });

    it('should handle JWT prefix correctly', async () => {
        const mockUser = { id: '1', username: 'testUser' };
        mockReq.headers = { authorization: 'JWT valid-token' };
        hashingStub.returns({ id: '1' });
        getUserStub.resolves(mockUser);

        await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

        sinon.assert.calledWith(hashingStub, 'valid-token');
        expect(mockReq.user).to.deep.equal(mockUser);
    });
});