import request from 'supertest';
import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'chai';

interface LoginResponse {
  token: string;
  user?: any;
}

interface RequestOptions {
  token?: string;
  pathParam?: string;
  query?: Record<string, string>;
  body?: Record<string, any>;
}

export class TestClient {
  private app: Application;
  private baseUrl: string;
  private token?: string;
  private bookId?: string;

  constructor(app: Application, baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.app = app;
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await request(this.app)
      .post('/api/v1/user/login')
      .send({ username, password });

    if (response.status !== StatusCodes.OK) {
      throw new Error(`Login failed: ${response.body.message}`);
    }

    this.token = response.body.data.token;
    return response.body.data;
  }

  async fetchAndSetBookId(jwt: string): Promise<string | undefined> {
    const response = await request(this.app)
      .get('/api/v1/books')
      .set('Authorization', `JWT ${jwt}`);

    if (response.status !== StatusCodes.OK) {
      throw new Error(`Fetching Book Id failed: ${response.body.message}`);
    }

    this.bookId = response.body.data[0].book_id;
    return this.bookId;
  }

  private constructUrl(path: string, pathParam?: string): string {
    const cleanPath = path.replace(/^\/|\/$/g, '');
    const param = pathParam || this.bookId || '';
    
    const parts = [this.baseUrl];
    if (cleanPath) parts.push(cleanPath);
    if (param) parts.push(param);
    
    return parts.join('/');
  }

  async get(path: string = '', options: RequestOptions = {}) {
    const url = this.constructUrl(path, options.pathParam);
    const req = request(this.app).get(url);
    return this.addRequestOptions(req, options);
  }

  async post(path: string = '', options: RequestOptions = {}) {
    const url = this.constructUrl(path, options.pathParam);
    const req = request(this.app).post(url);
    return this.addRequestOptions(req, options);
  }

  async put(path: string = '', options: RequestOptions = {}) {
    const url = this.constructUrl(path, options.pathParam);
    const req = request(this.app).put(url);
    return this.addRequestOptions(req, options);
  }

  async delete(path: string = '', options: RequestOptions = {}) {
    const url = this.constructUrl(path, options.pathParam);
    const req = request(this.app).delete(url);
    return this.addRequestOptions(req, options);
  }

  private addRequestOptions(req: request.Test, options: RequestOptions) {
    const token = options.token || this.token;
    
    if (token) {
      req.set('Authorization', `JWT ${token}`);
    }

    if (options.query) {
      req.query(options.query);
    }

    if (options.body) {
      req.send(options.body);
    }

    return req;
  }

  getToken(): string | undefined {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  getStoredBookId(): string | undefined {
    return this.bookId;
  }

  setStoredBookId(id: string) {
    this.bookId = id;
  }
}

export const createTestClient = (app: Application, baseUrl: string) => {
  return new TestClient(app, baseUrl);
};

export const expectSuccess = (response: request.Response, message?: string) => {
  expect(response.status).to.equal(StatusCodes.OK);
  expect(response.body.status).to.equal('success');
  if (message) {
    expect(response.body.message).to.equal(message);
  }
};

export const expectUnauthorized = (response: request.Response) => {
  expect(response.status).to.equal(StatusCodes.UNAUTHORIZED);
};