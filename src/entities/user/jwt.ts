import { Response } from 'express';
import jwt from 'jsonwebtoken';

export function generateAccessToken(payload: { id: string }): string {
	const token = jwt.sign({ id: payload.id }, process.env.JWT_SECRET!, {
		expiresIn: '15m',
	});
	return token;
}

export function setAccessToken(
	payload: { id: string },
	response: Response
): string {
	const token = generateAccessToken(payload);
	response.header('Authorization', token);
	return token;
}

export function verifyAccessToken(token: string) {
	return jwt.verify(token, process.env.JWT_SECRET!);
}

export function generateRefreshToken(payload: { id: any; tokenVersion?: any }) {
	return jwt.sign(
		{ id: payload.id, tv: payload.tokenVersion },
		process.env.JWT_REFRESH_SECRET!,
		{
			expiresIn: '7d',
		}
	);
}

export function setRefreshToken(
	payload: { id: any; tokenVersion?: any },
	response: Response
): string {
	const token = generateRefreshToken(payload);
	response.cookie('aid', token, {
		httpOnly: true,
		expires: new Date(Date.now() + 604800000),
	});
	return token;
}

export function verifyRefreshToken(token: string) {
	return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
}
