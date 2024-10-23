
import { BaseEntity } from '../../shared/utils/base-entity';

export class BookEntity extends BaseEntity<BookEntity> {
    id: string;
    title: string;
    authors: string[];
    publisher: string;
    published: string;
    genre: string[];
    summary?: string;
    cover_image?:string;
    price:number;
}

export class PurchaseEntity extends BaseEntity<PurchaseEntity>{
    id: string;
    payment_reference: string;
    status: string;
    user_id: string;
    book_id: string;
    purchase_date: string;
    quantity: number;
    total_price:number;
}

