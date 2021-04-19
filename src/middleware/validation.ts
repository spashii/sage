import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import removeNullProperties from '../util/removeNullValues';
import { genericInvalidResponse } from '../util';

export default function validate(schema: Joi.ObjectSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		const { error } = schema.validate(removeNullProperties(req.body));

		console.log(req.body);

		if (error) {
			return genericInvalidResponse(res, 'Invalid data sent to the server', error);
		}

		return next();
	};
}
