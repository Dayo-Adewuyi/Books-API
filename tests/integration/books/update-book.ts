import { describe, it, before } from 'mocha';
import app from '../../../src/config/express';
import { createTestClient, expectSuccess, expectUnauthorized } from '../test.utils';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

const baseURL = '/api/v1/books';

describe(`Update Endpoint: ${baseURL}`, () => {
    const client = createTestClient(app, baseURL);
    const payload = {
        title: faker.string.alpha(10),
        authors: [faker.person.fullName(), faker.person.fullName()],
        publisher: faker.person.fullName(),
        published: faker.date.past(),
        genre: [faker.music.genre(), faker.music.genre()],
        summary: faker.lorem.sentence(),
        price: faker.number.float(),
    };

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

    it('should not update a book when an invalid token is added', async () => {
        const response = await client.put('', { 
            token: 'invalid_token',
            body: payload 
        });
        expectUnauthorized(response);
    });

    it("should update a book when authorized", async () => {
        const response = await client.put('', { 
            body: payload 
        });
        expectSuccess(response, 'Book Updated Successfully');
        
        expect(response.body.data).to.include({
            title: payload.title,
            publisher: payload.publisher,
            summary: payload.summary
        });
    });

    it("should not update a book with a nonexistent bookId", async () => {
        const nonexistentId = faker.string.uuid();
        const response = await client.put('', { 
            pathParam: nonexistentId,
            body: payload 
        });
        
        expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
       
    });
});