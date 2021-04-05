import * as express from 'express';
import cookieParser from 'cookie-parser';

const router = express.Router();

import { register, login, refreshToken } from '../controllers/user';

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', cookieParser(), refreshToken);

export default router;
