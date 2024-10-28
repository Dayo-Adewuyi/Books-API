import { describe, it, before } from 'mocha';
import app from '../../../src/config/express';
import { createTestClient, expectSuccess, expectUnauthorized } from '../test.utils';
import { expect } from 'chai';
import {faker} from '@faker-js/faker';

const baseURL = '/api/v1/books';

describe(`Fetch User Purchases Endpoint: ${baseURL}`, () => {
  const client = createTestClient(app, baseURL);
  let userId: string

  before(async () => {
    const {user}=await client.login('Jane Doe', 'what333i');
    if(!user){
        throw new Error('user does not exist')
    }
    userId = user.id
  });


  it('should not fetch a book when an invalid token is added', async () => {
    const response = await client.get('/transactions', { token: 'invalid_token' });
    expectUnauthorized(response);
  });

  it("should fetch all transactions when authorized", async () => {
    const response = await client.get('/transactions',{
      pathParam: userId
    });
    expectSuccess(response, 'Purchases Fetched Successfully');
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.greaterThan(0);
    expect(response.body.totalRecords).to.be.greaterThan(0);
    expect(response.body.totalPages).to.be.greaterThan(0);
    expect(response.body.page).to.be.greaterThan(0);

  });

 

  it("should not fetch a transactions with a nonexistent userId",async()=>{
    const fakeUser = faker.string.uuid()
    const response = await client.get(`/transactions`,{
      pathParam: fakeUser
    }
    )
    expect(response.status).to.equal(400)
  })
});