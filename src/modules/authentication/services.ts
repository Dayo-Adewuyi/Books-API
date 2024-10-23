import authRepository, { AuthRepository } from './repositories';
import * as authParams from './entities';
import { ConflictException, NotFoundException, UnAuthorizedException } from '../../shared/errors';
import hashingService, { HashingService } from '../../shared/services/hashing/hashing.service';

/**
 * The AuthServices interface provides methods to interact with the database.
 * It provides methods to create and retrieve user data.
 */
export interface AuthServices {
  createUser(params: authParams.UserEntity): Promise<ConflictException | void>;
  validateUser(email: string, password: string): Promise<authParams.UserEntity | UnAuthorizedException>;
}

/**
 * The AuthServiceImpl class implements the AuthServices interface.
 * It provides methods to interact with the database.
 * It provides methods to create and retrieve user data.
 */
export class AuthServiceImpl implements AuthServices {
  constructor(
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
  ) { }

  public async getUser(param: string): Promise<authParams.UserEntity | NotFoundException> {
    return this.authRepository.getUser(param);
  }

  public async createUser(params: authParams.UserEntity): Promise<ConflictException | void> {

    const resp = await this.getUser(params.username);
    if (resp instanceof authParams.UserEntity) {
      // user already exists
      return new ConflictException('User already exists');
    }

    params.password = await this.hashingService.hash(params.password);

    await this.authRepository.createUser(params);

  }



  public async validateUser(username: string, password: string): Promise<authParams.UserEntity | UnAuthorizedException> {

    const resp = await this.getUser(username);

    if (resp instanceof NotFoundException) {
      return new UnAuthorizedException('Incorrect username and password combination');
    }


    const passwordMatch = await this.hashingService.compare(password, resp.password);

    if (!passwordMatch) {
      return new UnAuthorizedException('Incorrect username and password combination');
    }

    return new authParams.UserEntity({
      id: resp.id,
      username: resp.username,
    });

  }
}

const AuthServices = new AuthServiceImpl(hashingService, authRepository);

export default AuthServices;
