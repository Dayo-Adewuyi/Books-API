import { BaseEntity } from '../../shared/utils/base-entity';

export class UserEntity extends BaseEntity<UserEntity> {
    id: string;
    username: string;
    password: string;
    purchases: Purchases;
}

export type Purchases = {
    id?: string,
    user_id: string,
    book_id: string,
    purchase_date?: string,
    quantity?: number,
    total_price?: number,
}