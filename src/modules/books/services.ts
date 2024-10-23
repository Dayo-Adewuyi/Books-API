import { BookEntity, PurchaseEntity } from './entities';
import bookRepository, { BookRepository } from './repositories';
import { BadException,  InternalServerErrorException,  NotFoundException } from '../../shared/errors';
  import paymentService, { PaymentService,  InitializationResponse} from '../../shared/utils/payment';

  /**
   * The BookServices interface provides methods to interact with the database.
   * It provides methods to create, update, fetch, delete and buy books.
   * It also provides methods to fetch all books and user purchases.
   * @interface BookServices
   */
export interface BookServices {
  createBook(params: BookEntity): Promise<BookEntity>;
  fetchAllBooks(options?: {
    limit?: number;
    offset?: number;
    genre?: string;
    author?: string;
  }): Promise<{
    data: BookEntity[];
    total: number;
  }>;
  fetchBook(bookId: string): Promise<BookEntity>;
  deleteBook(bookId: string): Promise<boolean>;
  updateBook(bookId: string, params: Partial<BookEntity>): Promise<BookEntity>;
  fetchUserPurchases(userId: string): Promise<PurchaseEntity[]>;
  createPurchase( params: PurchaseEntity): Promise<InitializationResponse>;
}

/**
 * The BookServiceImpl class implements the BookServices interface.
 * It provides methods to interact with the database.
 * It provides methods to create, update, fetch, delete and buy books.
 * It also provides methods to fetch all books and user purchases.
 * @class BookServiceImpl
 * @implements BookServices
 * @param bookRepository - Repository responsible for handling book data.
 * @param paymentService - Service responsible for handling payment logic.
 */
export class BookServiceImpl implements BookServices {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly paymentService: PaymentService
  ) { }
  public async createBook(params: BookEntity): Promise<BookEntity> {
    const response = await this.bookRepository.createBook(params);
    return response;
  }

  public async fetchAllBooks(options: {
    limit?: number;
    offset?: number;
    genre?: string;
    author?: string;
  } = {}): Promise<{ data: BookEntity[]; total: number }> {

    const { limit = 10, offset = 0, genre, author } = options;



    const response = await this.bookRepository.fetchAllBooks();


    let filteredBooks = response;
    if (genre) {
      filteredBooks = filteredBooks.filter(book =>
        book.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      );
    }
    if (author) {
      filteredBooks = filteredBooks.filter(book =>
        book.authors.some(a => a.toLowerCase().includes(author.toLowerCase()))
      );
    }

    const paginatedBooks = filteredBooks.slice(offset, offset + limit);

    return {
      data: paginatedBooks,
      total: filteredBooks.length
    };
  }

  public async fetchBook(bookId: string): Promise<BookEntity> {
    const response = await this.bookRepository.fetchBook(bookId)
    if (!response) {
      throw new BadException(`Book not found with id: ${bookId}`);
    }

    return response;
  }

  public async updateBook(bookId: string, params: Partial<BookEntity>): Promise<BookEntity> {
    const existingBook = await this.fetchBook(bookId);

    const updateParams = {
      bookId: bookId,
      title: params.title ?? existingBook.title,
      authors: params.authors ?? existingBook.authors,
      publisher: params.publisher ?? existingBook.publisher,
      published: params.published ?? existingBook.published,
      genre: params.genre ?? existingBook.genre,
      summary: params.summary ?? existingBook.summary,
      cover_image: params.cover_image ?? existingBook.cover_image
    };
    const response = await this.bookRepository.updateBook(updateParams)
    if (!response) {
      throw new NotFoundException(`Failed to update book with id: ${bookId}`);
    }
    return response;
  }

  public async deleteBook(bookId: string): Promise<boolean> {
    await this.fetchBook(bookId)
    await this.bookRepository.deleteBook(bookId)
    return true;
  }

  public async createPurchase( params: PurchaseEntity): Promise<InitializationResponse> {
    const book = await this.bookRepository.fetchBook(params.book_id)
    if(!book){
      throw new NotFoundException("book not found")
    }
    const price = book.price * 100 * params.quantity
    const initializePayment = await this.paymentService.initialize(params.user_id, price.toString())
    params.payment_reference = initializePayment.reference
    params.total_price = price
    const purchase = await this.bookRepository.createPurchase(params)
    if (!purchase) {
      throw new InternalServerErrorException("creating purchase failed")
    }
    return initializePayment;
  }

  public async fetchUserPurchases(userId: string): Promise<PurchaseEntity[]> {
    
    const purchases = await this.bookRepository.fetchUserPurchases(userId)
    return purchases
  }

}

const BookServices = new BookServiceImpl(bookRepository, paymentService);

export default BookServices;
