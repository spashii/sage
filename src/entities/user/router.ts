import * as express from 'express';
import cookieParser from 'cookie-parser';

const router = express.Router();

import { register, login, refreshToken, revokeRefreshToken } from '.';
import { loginSchema, registerSchema } from './model';
import { protectedRoute, validate } from '../../middleware';

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', cookieParser(), refreshToken);
router.delete(
	'/refresh-token',
	protectedRoute,
	cookieParser(),
	revokeRefreshToken
);

export default router;
