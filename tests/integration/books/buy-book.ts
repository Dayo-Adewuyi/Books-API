import { describe, it, before } from 'mocha';
import app from '../../../src/config/express';
import { createTestClient, expectSuccess, expectUnauthorized } from '../test.utils';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

const baseURL = '/api/v1/books';

describe(`Buy Book Endpoint: ${baseURL}`, () => {
    const client = createTestClient(app, baseURL);
    const payload = {
       quantity: faker.number.int({
        min:1,max:10
       }),
    };
    before(async () => {
        try {
            await client.login('Jane Doe', 'what333i');
            
            await client.fetchAndSetBookId(client.getToken()!);
            
            
             const bookId = client.getStoredBookId();
             if (!bookId) {
                 throw new Error('Failed to get a valid book ID');
             }
            //  storedBookId = bookId;
            
        } catch (error) {
            console.error('Setup failed:', error);
            throw error;
        }
    });

    it('should not buy a book when an invalid token is added', async () => {
        const response = await client.post(`/buy/`, { 
            token: 'invalid_token',
            body: payload 
        });
        expectUnauthorized(response);
    });

    it("should buy a book when authorized", async () => {
        const response = await client.post(`/buy`, { 
            body: payload 
        });
        expectSuccess(response, 'Payment Initiated Successfully');
        expect(response.body).to.have.property('message');
        expect(response.body.data).to.have.property('reference');
        expect(response.body.data).to.have.property('access_code');
        expect(response.body.data).to.have.property('authorization_url')
        
    });

    it("should not buy a book with a nonexistent bookId", async () => {
        const nonexistentId = faker.string.uuid();
        const response = await client.post(`/buy`, { 
            body: payload,
            pathParam: nonexistentId 
        });
        expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
       
    });
});