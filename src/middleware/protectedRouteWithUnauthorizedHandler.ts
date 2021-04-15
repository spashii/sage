import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../entities/user/jwt';

export default function protectedRouteWithUnauthorizedHandler(
	unauthorizedHandler: (req: Request, res: Response) => any
) {
	return async function protectedRoute(req: Request, res: Response, next: NextFunction) {
		const token = req.header('Authorization');
		if (!token) {
			// forwarding to unauthorized handler
			return unauthorizedHandler(req, res);
		}

		try {
			const payload = verifyAccessToken(token);
			req.body.authorization = payload;
			return next();
		} catch (err) {
			return unauthorizedHandler(req, res);
		}
	};
}
