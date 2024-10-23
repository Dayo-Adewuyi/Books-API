import * as dtos from './dto';
import { fnRequest } from '../../shared/types';
import { StatusCodes } from 'http-status-codes';
import bookservices, {BookServices} from './services';

/**
 * The BooksController class handles book logic.
 * It provides methods to create, update, fetch, delete and buy books.
 * It also provides methods to fetch all books and user purchases.
 * @class BooksController
 * @param bookServices - Service responsible for handling book logic like creating, updating, fetching, deleting and buying books.
 */
export class BooksController {
  constructor(
    private readonly bookServices: BookServices,
  ) { }
  public createBook: fnRequest = async (req, res) => {
    if(req.file){
      req.body.cover_image = req.file.buffer
    }
    const fetchBookPayload = new dtos.BookDto(req.body);
    const data = await this.bookServices.createBook(fetchBookPayload)
    res.status(StatusCodes.CREATED).json({ 
      status: 'success',
      statuscode: StatusCodes.CREATED,
      message: "Book Created Successfully",
      data });
  };

  public updateBook: fnRequest = async(req, res)=>{
    if(req.file){
      req.body.cover_image = req.file.buffer
    }
    const fetchBookPayload = new dtos.BookDto(req.body)
    const data = await this.bookServices.updateBook(req.params.bookId, fetchBookPayload)
    res.status(StatusCodes.OK).json({
      status: 'success',
      statuscode: StatusCodes.OK,
      message: "Book Updated Successfully",
      data
    })
  }

  public fetchBook: fnRequest = async(req,  res)=>{
    const data = await this.bookServices.fetchBook(req.params.bookId)
    res.status(StatusCodes.OK).json({
      status: 'success',
      statuscode: StatusCodes.OK,
      message: "Book Fetched Successfully",
      data
    })
  }
  
  public fetchAllBooks: fnRequest = async(req, res)=> {
    const data = await this.bookServices.fetchAllBooks(req.query)
    res.status(StatusCodes.OK).json({
      status: 'success',
      statuscode: StatusCodes.OK,
      message: "Books Fetched Successfully",
      data
    })
  }

  public deleteBook: fnRequest = async(req, res)=>{
    const response = await this.bookServices.deleteBook(req.params.bookId)
    if(response){res.status(StatusCodes.OK).json({
      status: 'success',
      statuscode: StatusCodes.OK,
      message: "Books Deleted Successfully",
    })
  }}

  public buyBook: fnRequest= async(req,res)=>{
    const fetchPayload = new dtos.PurchaseDto(req.body)
    fetchPayload.user_id = req.user.id
    fetchPayload.book_id=req.params.bookId
    const data = await this.bookServices.createPurchase(fetchPayload)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      statuscode: StatusCodes.OK,
      message: "Payment Initiated Successfully",
      data
    })
  }

  public fetchUserPurchase: fnRequest = async(req,res)=>{
    const data = await this.bookServices.fetchUserPurchases(req.params.userId)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      statuscode:StatusCodes.OK,
      message:"Purchases Fetched Successfully",
      data
    })
  }
}

const bookController = new BooksController(bookservices);

export default bookController;
