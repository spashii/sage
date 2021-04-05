import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default async function protectedRoute(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const token = req.header('Authorization');
	if (!token) {
		return res.status(401).json({ message: 'Access denied' });
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET!);
		console.log(payload);
		req.body.__user__ = payload;
		return next();
	} catch (err) {
		return res.status(400).json({ message: 'Invalid token' });
	}
}
