CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS books (
    book_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    authors TEXT[] NOT NULL, 
    publisher VARCHAR(255) NOT NULL,
    published DATE NOT NULL,
    genre TEXT[] NOT NULL, 
    summary TEXT,
    cover_image BYTEA,
    price DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_reference VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', 
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, 
    book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT status_check CHECK (status IN ('pending', 'successful', 'failed'))
);


CREATE INDEX idx_user_id ON purchases(user_id);
CREATE INDEX idx_book_id ON purchases(book_id);
