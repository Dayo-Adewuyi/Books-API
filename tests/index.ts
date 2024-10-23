// Unit tests
import './unit/base-entity';
import './unit/middlewares/globalLogger';
import './unit/error';
import './unit/env';

// Integration tests
import './integration/authentication/auth_flow'
import './integration/books'

import './unit/middlewares/authMiddleware';
import './unit/middlewares/imageMiddleware';
import './unit/middlewares/requestValidator';