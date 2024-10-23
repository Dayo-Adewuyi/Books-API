import { BaseEntity } from '../../shared/utils/base-entity';
import { Purchases } from './entities';

export class UserDto extends BaseEntity<UserDto> {
  id: string;
  username: string;
  password: string;
  purchases: Purchases;
}