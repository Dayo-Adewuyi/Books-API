import { ExpressController } from '../types/index';
import hashingService from '../services/hashing/hashing.service';
import { UnAuthorizedException, NotFoundException } from '../errors/index';
import AuthServices from '../../modules/authentication/services';
import { JwtPayload } from 'jsonwebtoken';

/** 
 * AuthMiddleware is a middleware function that checks if the user is authenticated.
 * It verifies the JWT token provided in the Authorization header.
 * If the token is valid, it decodes the token and attaches the user object to the request object.
*/

interface CustomJwtPayload extends JwtPayload {
    id: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: any;
            file?: Express.Multer.File
        }
    }
}

export const authMiddleware: ExpressController = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnAuthorizedException('No authorization header provided');
        }

        let token: string | undefined;

        if (authHeader.startsWith('JWT ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            throw new UnAuthorizedException('Invalid authorization header format');
        }

        try {
            const decoded = hashingService.verify(token) as CustomJwtPayload
            const id = decoded.id
            if (!decoded.id) {
                throw new UnAuthorizedException('Invalid token payload');
            }

            const user = await AuthServices.getUser(id)
            if(user instanceof NotFoundException){
                throw new UnAuthorizedException("user does not exist")
            }
            req.user = user;
            if (next) next();
        } catch (error) {
            throw new UnAuthorizedException('Invalid or expired token');
        }
    } catch (error) {
        if (next) next(error);
    }
};

export default authMiddleware;
