import { BookEntity, PurchaseEntity } from './entities';
import bookRepository, { BookRepository } from './repositories';
import { BadException,  InternalServerErrorException } from '../../shared/errors';
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
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly DEFAULT_OFFSET = 0;
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
    const { 
      limit = BookServiceImpl.DEFAULT_LIMIT, 
      offset = BookServiceImpl.DEFAULT_OFFSET, 
      genre, 
      author 
    } = options;

  
    const response = await this.bookRepository.fetchAllBooks();
    let filteredBooks = response;

    if (genre || author) {
      filteredBooks = this.filterBooks(response, { genre, author });
    }

    const total = filteredBooks.length;
    const paginatedBooks = filteredBooks.slice(offset, offset + limit);

    return {
      data: paginatedBooks,
      total
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
    const updateParams = this.mergeBookParams(existingBook, params);
    const response = await this.bookRepository.updateBook(updateParams);
    if (!response) {
      throw new InternalServerErrorException(`Failed to update book with id: ${bookId}`);
    }

    return response;
  }

  public async deleteBook(bookId: string): Promise<boolean> {
    await this.fetchBook(bookId); 
    await this.bookRepository.deleteBook(bookId);
    return true;
  }

  public async createPurchase( params: PurchaseEntity): Promise<InitializationResponse> {
    const book = await this.fetchBook(params.book_id);
    const price = this.calculateTotalPrice(book.price, params.quantity);
    
    const initializePayment = await this.paymentService.initialize(
      params.user_id, 
      price.toString()
    );

    const purchaseParams = {
      ...params,
      payment_reference: initializePayment.reference,
      total_price: price
    };

    const purchase = await this.bookRepository.createPurchase(purchaseParams);
    if (!purchase) {
      throw new InternalServerErrorException('Failed to create purchase');
    }

    return initializePayment;
  }

  public async fetchUserPurchases(userId: string): Promise<PurchaseEntity[]> {
    
    const purchases = await this.bookRepository.fetchUserPurchases(userId)
    return purchases
  }

  private filterBooks(books: BookEntity[], filters: { genre?: string; author?: string }): BookEntity[] {
    return books.filter(book => {
      const genreMatch = !filters.genre || book.genre.some(g => 
        g.toLowerCase() === filters.genre?.toLowerCase()
      );
      
      const authorMatch = !filters.author || book.authors.some(a => 
        a.toLowerCase().includes(filters.author?.toLowerCase() ?? '')
      );

      return genreMatch && authorMatch;
    });
  }
  private mergeBookParams(existingBook: BookEntity, params: Partial<BookEntity>): BookEntity {
    return {
      ...existingBook,
      ...params,
      id: existingBook.id 
    };
  }

  private calculateTotalPrice(basePrice: number, quantity: number): number {
    return Math.round(basePrice * 100 * quantity);
  }
}

const BookServices = new BookServiceImpl(bookRepository, paymentService);

export default BookServices;
