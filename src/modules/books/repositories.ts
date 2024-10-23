import { BookEntity, PurchaseEntity } from "./entities";
import bookQueries from './query';
import { db } from '../../config/database';

/**
 * The BookRepository interface provides methods to interact with the database.
 * It provides methods to create and retrieve book data.
 * @interface BookRepository
 */
export interface BookRepository {
  createBook(params: BookEntity): Promise<BookEntity>;
  fetchAllBooks(): Promise<BookEntity[]>;
  fetchBook(bookId: string): Promise<BookEntity>;
  deleteBook(bookId: string): Promise<void>;
  updateBook(params: Partial<BookEntity>): Promise<BookEntity>;
  fetchUserPurchases(userId: string): Promise<PurchaseEntity[]>;
  createPurchase(params: PurchaseEntity): Promise<string>;
}

/**
 * The BookRepositoryImpl class implements the BookRepository interface.
 *  It provides methods to interact with the database.
 * It provides methods to create, retrieve,update book data and fetch user purchases.
 * @class BookRepositoryImpl
 *  @implements BookRepository
 * @param db - The database connection.
 * @param bookQueries - The queries to interact with the database.
 * @param BookEntity - The entity to interact with the database.
 * @param PurchaseEntity - The entity to interact with the database.
 */ 
export class BookRepositoryImpl implements BookRepository {

  public async createBook(params: BookEntity): Promise<BookEntity> {
    return db.one(bookQueries.createBook, {
      title: params.title,
      authors: params.authors,
      publisher: params.publisher,
      published: params.published,
      genre: params.genre,
      summary: params.summary,
      cover_image: params.cover_image,
      price: params.price
    });
  }

  public async updateBook(params: Partial<BookEntity>): Promise<BookEntity> {
    const updatedBook = await db.one(bookQueries.updateBook, params);
    return updatedBook;
  }

  public async fetchAllBooks(): Promise<BookEntity[]> {
    const books = await db.manyOrNone(bookQueries.getAllBooks);
    return books || [];
  }

  public async fetchBook(bookId: string): Promise<BookEntity> {
    const book = await db.oneOrNone(bookQueries.getBookById, [bookId]);


    return book;
  }

  public async deleteBook(bookId: string): Promise<void> {

    await db.one(bookQueries.deleteBook, [bookId]);
  }

  public async fetchUserPurchases(userId: string): Promise<PurchaseEntity[]> {
    const purchases = await db.manyOrNone(bookQueries.getUserPurchases, [userId])
    return purchases || [];
  }

  public async createPurchase(params: PurchaseEntity): Promise<string> {

    return db.one(bookQueries.createPurchase, {
      payment_reference: params.payment_reference,
      user_id: params.user_id,
      book_id: params.book_id,
      quantity: params.quantity,
      total_price: params.total_price
    })
  }
}

export const bookRepository = new BookRepositoryImpl();

export default bookRepository;