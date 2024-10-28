import { describe, it, before } from 'mocha';
import app from '../../../src/config/express';
import { createTestClient, expectSuccess, expectUnauthorized } from '../test.utils';
import { expect } from 'chai';
import {faker} from '@faker-js/faker';

const baseURL = '/api/v1/books';

describe(`Fetch Book(s) Endpoint: ${baseURL}`, () => {
  const client = createTestClient(app, baseURL);
  let testBookId: string;

  before(async () => {
    await client.login('Jane Doe', 'what333i');
  });


  it('should not fetch a book when an invalid token is added', async () => {
    const response = await client.get('', { token: 'invalid_token' });
    expectUnauthorized(response);
  });

  it("should fetch all books when authorized", async () => {
    const response = await client.get('');
    expectSuccess(response, 'Books Fetched Successfully');
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.greaterThan(0);
    expect(response.body.totalRecords).to.be.greaterThan(0);
    expect(response.body.totalPages).to.be.greaterThan(0);
    expect(response.body.page).to.be.greaterThan(0);
    testBookId = response.body.data[0].book_id;
  });

  it("should fetch a single book when the bookId is provided", async () => {
    const response = await client.get(`/${testBookId}`)
    expectSuccess(response, 'Book Fetched Successfully')
    expect(response.body).to.have.property('data')
    expect(response.body.data).to.have.property('book_id')
    expect(response.body.data).to.have.property('title')
    expect(response.body.data).to.have.property('authors')
    expect(response.body.data).to.have.property('publisher')
    expect(response.body.data).to.have.property('published')
    expect(response.body.data).to.have.property('genre')
    expect(response.body.data).to.have.property('summary')
    expect(response.body.data).to.have.property('price')
  })

  it("should not fetch a book with a nonexistent bookId",async()=>{
    const book = faker.string.uuid()
    const response = await client.get(`/${book}`)
    expect(response.status).to.equal(400)
  })
});