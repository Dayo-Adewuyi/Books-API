import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { describe, it } from 'mocha';
import app from '../../../src/config/express';
import { faker } from '@faker-js/faker';
import { createTestClient, expectSuccess, expectUnauthorized } from '../test.utils';

const baseUrl = '/api/v1/user';
const testClient = createTestClient(app, baseUrl);

describe('User Authentication API', () => {
    const testUser = {
        username: "Jane Doe",
        password: "what333i"
    };

    describe('Registration', () => {
        it('should successfully register a new user', async () => {
            const response = await testClient.post('/register', { 
                body: testUser 
            });
            expectSuccess(response, 'User registered successfully');
        });

        it('should prevent duplicate username registration', async () => {
            const duplicateUser = {
                username: testUser.username,
                password: faker.internet.password()
            };

            const response = await testClient.post('/register', { 
                body: duplicateUser 
            });
            expect(response.status).to.equal(StatusCodes.CONFLICT);
            expect(response.body.status).to.equal('error');
            expect(response.body.message).to.equal('User already exists');
        });
    });

    describe('Login', () => {
        it('should successfully login with valid credentials', async () => {
            const response = await testClient.post('/login', { 
                body: testUser 
            });
            expectSuccess(response, 'User logged in successfully');
        });

        it('should reject login with incorrect password', async () => {
            const invalidCredentials = {
                username: testUser.username,
                password: faker.internet.password()
            };

            const response = await testClient.post('/login', { 
                body: invalidCredentials 
            });
            expectUnauthorized(response);
            expect(response.body.message).to.equal('Incorrect username and password combination');
        });

        it('should reject login with non-existent username', async () => {
            const nonExistentUser = {
                username: faker.internet.userName(),
                password: testUser.password
            };

            const response = await testClient.post('/login', { 
                body: nonExistentUser 
            });
            expectUnauthorized(response);
            expect(response.body.message).to.equal('Incorrect username and password combination');
        });
    });
});