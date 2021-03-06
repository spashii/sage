import { NextFunction, Request, Response } from 'express';
import { genericInvalidResponse } from '../util';
import { verifyAccessToken } from '../entities/user/jwt';

export default function protectedRoute(req: Request, res: Response, next: NextFunction) {
	const token = req.header('Authorization');
	if (!token) {
		return res.status(401).json({ message: 'Access denied' });
	}

	try {
		const payload = verifyAccessToken(token);
		req.body.authorization = payload;
		return next();
	} catch (err) {
		return genericInvalidResponse(res, `Invalid token`, err);
	}
}
