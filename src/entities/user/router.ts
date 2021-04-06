import * as express from 'express';
import cookieParser from 'cookie-parser';

const router = express.Router();

import { register, login, refreshToken } from '.';
import { loginSchema, registerSchema } from './model';
import { validate } from '../../middleware/validation';

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', cookieParser(), refreshToken);

export default router;
