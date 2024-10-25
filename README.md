# Books RESTful API

A RESTful API which allows to perform CRUD operations on `books` documents stored in a POSTGRES database. It is secured with the use of JWT.

[Getting Started](#getting-started)  
[Installation](#installation)  
[Running the Tests](#running-the-tests)  
[Available Endpoints](#available-endpoints)  
[User Authorization Endpoints](#user-authorization-endpoints)  
[Books Endpoints](#books-endpoints)  
[Built With](#built-with)


## Getting Started

### Installation

1. Clone this repository.
2. Go to the project's root directory.
3. Fill in the `.env` file with your details as outlined in the `.env.example` file. 
4. Open terminal.
5. Run `npm install`.
6. After installation is complete, you can start the REST server by running `npm start`.

### Running the Tests

You can run the tests by running `npm test` in terminal in projects root directory.

__Example:__

```
$ npm test
...
User Authentication API
    Registration
      ✔ should successfully register a new user (156ms)
      ✔ should prevent duplicate username registration
    Login
      ✔ should successfully login with valid credentials (71ms)
      ✔ should reject login with incorrect password (67ms)
      ✔ should reject login with non-existent username

  Create Books Endpoint: /api/v1/books
    ✔ should not create a book when authorization header is missing
    ✔ should not create a book when an invalid token is added to the authorization header
    ✔ should create a book when the correct details are sent in the payload
    ✔ should create a book when cover_image field is declared

  Fetch Book(s) Endpoint: /api/v1/books
    ✔ should not fetch a book when an invalid token is added
    ✔ should fetch all books when authorized
    ✔ should fetch a single book when the bookId is provided
    ✔ should not fetch a book with a nonexistent bookId

  Update Endpoint: /api/v1/books
    ✔ should not update a book when an invalid token is added
    ✔ should update a book when authorized
    ✔ should not update a book with a nonexistent bookId

  Delete Books Endpoint: /api/v1/books
    ✔ should not delete a book when an invalid token is added
    ✔ should delete a book when authorized
    ✔ should not delete a book with a nonexistent bookId

  Buy Book Endpoint: /api/v1/books
    ✔ should not buy a book when an invalid token is added
    ✔ should buy a book when authorized
    ✔ should not buy a book with a nonexistent bookId

  Fetch User Purchases Endpoint: /api/v1/books
    ✔ should not fetch a book when an invalid token is added
    ✔ should fetch all transactions when authorized
    ✔ should not fetch a transactions with a nonexistent userId

  AuthMiddleware
    ✔ should call next with UnAuthorizedException when auth header is missing
    ✔ should call next with UnAuthorizedException when token format is invalid
    ✔ should call next with UnAuthorizedException when token verification fails
    ✔ should call next with UnAuthorizedException when token payload has no id
    ✔ should call next with UnAuthorizedException when user does not exist
    ✔ should set user in request object and call next when authentication succeeds
    ✔ should handle JWT prefix correctly

  ImageMiddleware
    Basic Validation
      ✔ should throw InternalServerErrorException when next is not provided
      ✔ should throw BadException when cover_image is in body but content-type is not multipart
      ✔ should call next() when no cover_image in body
    Content-Type Handling
      ✔ should process request without content-type header
      ✔ should handle various content-type formats

  Validation Middleware
    RequestBodyValidatorMiddleware
      ✔ should pass validation with valid body data
      ✔ should fail validation with invalid body data
      ✔ should handle existence checks correctly
      ✔ should fail when existence check fails
    CombinedValidatorMiddleware
      ✔ should validate all parts of the request successfully
      ✔ should fail if any part of the request is invalid
      ✔ should handle file uploads with correct content type
      ✔ should handle complex existence checks across different request parts
    RequestQueryValidatorMiddleware
      ✔ should validate query parameters successfully
      ✔ should fail with invalid query parameters
    RequestParamsValidatorMiddleware
      ✔ should validate URL parameters successfully
      ✔ should fail with missing required parameters

...
```

## Available Endpoints

Before you can access the data stored in the database, you will need to register to the service and login to get a JWT. The JWT provided on successful login can be used to access the other endpoints

### User Authorization Endpoints

The endpoints allows developers to register and login to the service to get a JWT which is required as authorization in request header in all other endpoints.

#### POST /user/register

Registers a user to the service

__Parameters__

| Name | Required/Optional | Data Type | Description |
|------|-------------------|-----------|-------------|
| username | Required | String | Username you want to register with |
| password | Required | String | Password you want to be associated with your username |

#### POST /user/login

Logins a user to the service to obtain a JWT.

__Parameters__

| Name | Type |Required/Optional | Data Type | Description |
|------|------|------------------|-----------|-------------|
| username | Request Body | Required | String | Username you want to login with |
| password | Request Body |Required | String | Password associated with your username |

### Books Endpoints

These endpoints allows access to the books details stored in the database. JWT required as authorization in headers of request for all of the endpoints below.

__Example Request Headers for accessing books endpoints:__

```
GET / HTTP/1.1
Host: localhost:8080
...
Authorization: JWT YOUR_TOKEN_HERE
...
```
#### GET /api/v1/books

Gets all the books details from the database

#### GET /api/v1/books/:bookId

Gets a single books details which matches the given id.

__Parameters__

| Name | Type |Required/Optional | Data Type | Description |
|------|------|------------------|-----------|-------------|
| bookId | Path Parameter | Required | String | Id of the book |

#### POST /api/v1/books

Adds a single books details to the database.

| Name | Type |Required/Optional | Data Type | Description |
|------|------|------------------|-----------|-------------|
| title | Request Body | Required | String | Title of the book |
| authors | Request Body | Required | [String] | Author(s) of the book |
| publisher | Request Body | Required | String | Publisher of the book |
| published | Request Body | Required | String | Published date |
| genre | Request Body | Required | [String] | Genre associated with the book |
| summary | Request Body | Optional | String | Summary of the book |
| price| Request Body | Optional | Float | Price of the book |
| cover_image | Request Body | Optional | Binary (Image) | Cover image of the book. If this parameter is to be passed in, make sure the `Content-Type` is set to `multipart/form-data` in request headers |

#### PUT /api/v1/books/:bookId

Updates a books details in the database.

| Name | Type |Required/Optional | Data Type | Description |
|------|------|------------------|-----------|-------------|
| title | Request Body | Required | String | Title of the book |
| authors | Request Body | Required | [String] | Author(s) of the book |
| publisher | Request Body | Required | String | Publisher of the book |
| published | Request Body | Required | String | Published date |
| genre | Request Body | Required | [String] | Genre associated with the book |
| summary | Request Body | Optional | String | Summary of the book |
| price| Request Body | Optional | Float | Price of the book |
| cover_image | Request Body | Optional | Binary (Image) | Cover image of the book. If this parameter is to be passed in, make sure the `Content-Type` is set to `multipart/form-data` in request headers |

#### DELETE /api/v1/books/:bookId

Deletes a book and it details (including cover image stored in filesystem if available).

| Name | Type |Required/Optional | Data Type | Description |
|------|------|------------------|-----------|-------------|
| bookId | Path Parameter | Required | String | Id of the book |

#### POST  /api/v1/buy/:bookId

purchases a book 

| Name | Type |Required/Optional | Data Type | Description |
|------|------|------------------|-----------|-------------|
| bookId | Path Parameter | Required | String | Id of the book |
| quantity | Request Body| Required | String | Quantity of books to be bought |

#### GET /api/v1/transactions/:userId

fetchs all the user's purchases

| Name | Type |Required/Optional | Data Type | Description |
|------|------|------------------|-----------|-------------|
| userId | Path Parameter | Required | String | Id of the user |

## Built With

* [express](https://expressjs.com/) - Web Framework used
* [bcrypt] - For password hahsing
* [dotenv] - To read in `.env` files
* [jsonwebtoken] - To sign and verify JWT
* [postgresql] - As an ODM to interact with mongoDB
* [morgan] - As a logger
* [multer] - Middleware used to handle incoming image files
* [Mocha / Chai] - Testing framework used