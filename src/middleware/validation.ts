import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export function validate(schema: Joi.ObjectSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		const { error } = schema.validate(req.body);

		if (error) {
			res.status(400).json({ message: error?.message });
			return;
		}

		next();
	};
}
