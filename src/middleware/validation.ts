import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { genericInvalidResponse } from '../util';

export default function validate(schema: Joi.ObjectSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		const { error } = schema.validate(req.body);

		if (error) {
			return genericInvalidResponse(res, 'Invalid data sent to the server', error);
		}

		return next();
	};
}
