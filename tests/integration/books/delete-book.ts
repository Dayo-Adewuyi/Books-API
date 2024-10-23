import { describe, it, before } from 'mocha';
import app from '../../../src/config/express';
import { createTestClient, expectSuccess, expectUnauthorized } from '../test.utils';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

const baseURL = '/api/v1/books';

describe(`Delete Books Endpoint: ${baseURL}`, () => {
    const client = createTestClient(app, baseURL);
    

    before(async () => {
        try {
            await client.login('Jane Doe', 'what333i');
            
            await client.fetchAndSetBookId(client.getToken()!);
            
            
            const storedBookId = client.getStoredBookId();
            if (!storedBookId) {
                throw new Error('Failed to get a valid book ID');
            }
        } catch (error) {
            console.error('Setup failed:', error);
            throw error;
        }
    });

    it('should not delete a book when an invalid token is added', async () => {
        const response = await client.delete('', { 
            token: 'invalid_token',
        });
        expectUnauthorized(response);
    });

    it("should delete a book when authorized", async () => {
        const response = await client.delete('');
        expectSuccess(response, 'Books Deleted Successfully');
        expect(response.body).to.have.property('message');
    });

    it("should not delete a book with a nonexistent bookId", async () => {
        const nonexistentId = faker.string.uuid();
        const response = await client.put('', { 
            pathParam: nonexistentId
        });
        
        expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
      
    });
});