import chaiHttp from 'chai-http';
import chai, { expect } from 'chai';
import { describe, it, before } from 'mocha';  
import { StatusCodes } from 'http-status-codes';
import app from '../../../src/config/express';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import path from 'path';

chai.use(chaiHttp);

const baseURL = '/api/v1/books';

describe(`Create Books Endpoint: ${baseURL}`, () => {
  let token: string;
  const testImagePath = path.join(__dirname, '../../test.jpg');

  before(async () => {
    const response = await request(app)
      .post(`/api/v1/user/login`)
      .send({
        username: "Jane Doe",
        password: "what333i"
      });
    token = response.body.data.token;
  });

  const payload = {
    title: faker.string.alpha(10),
    authors: [faker.person.fullName(), faker.person.fullName()],
    publisher: faker.person.fullName(),
    published: faker.date.past(),
    genre: [faker.music.genre(), faker.music.genre()],
    summary: faker.lorem.sentence(),
    price: faker.number.float(),
  };

  it('should not create a book when authorization header is missing', (done) => {
    chai.request(app)
      .post(baseURL)  
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);  
        expect(res.statusCode).to.equal(StatusCodes.UNAUTHORIZED);
        done();
      });
  });

  it('should not create a book when an invalid token is added to the authorization header', (done) => {
    chai.request(app)
      .post(baseURL)  
      .set('Authorization', `JWT ${token}kdlsjdlkjslkdj`)
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);  
        expect(res.statusCode).to.equal(StatusCodes.UNAUTHORIZED);
        done();
      });
  });

  it("should create a book when the correct details are sent in the payload", (done) => {
    chai.request(app)
      .post(baseURL)  
      .set('Authorization', `JWT ${token}`)
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);  
        expect(res.statusCode).to.equal(StatusCodes.CREATED);
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('Book Created Successfully');
        expect(res.body).to.have.property('data');
        expect(res.body.data).to.have.property('book_id');
        done(); 
      });
  });

  it("should create a book when cover_image field is declared", (done) => {
    chai.request(app)
      .post(baseURL)  
      .set('Authorization', `JWT ${token}`)
      .attach('cover_image', testImagePath)
      .field('title', faker.string.alpha(10))
      .field('authors[]', faker.person.fullName()) 
      .field('publisher', faker.person.fullName())
      .field('published', faker.date.past().toISOString()) 
      .field('genre[]', faker.music.genre())  
      .field('summary', faker.lorem.sentence())  
      .field('price', faker.number.float().toString())  
      .end((err, res) => {
        if (err) return done(err);  
        expect(res.statusCode).to.equal(StatusCodes.CREATED);
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('Book Created Successfully');
        expect(res.body).to.have.property('data');  
        expect(res.body.data).to.have.property('book_id');
        done();  
      });
  });
});