import { Response } from 'express';

export default function genericServerErrorResponse(res: Response, err: Error) {
	return res.status(500).json({ message: `Some error occurred(${err.message})` });
}
