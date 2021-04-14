import { Response } from 'express';

export default function genericInvalidResponse(res: Response, message: string, err?: Error) {
	return res.status(400).json({ message: `${message}${err ? ` (${err.message})` : ''}` });
}
