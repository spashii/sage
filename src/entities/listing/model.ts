import Joi from 'joi';

export interface IListing {
	id: string;
	userId: string;
	timestamp: Date;
	title: string;
	description?: string;
	imageUrl?: string;
	startingPrice: number;
	isSold?: boolean;
	isBiddable: boolean;
	bidCurrentPrice?: number;
	expiresOn?: Date;
}

export const addListingSchema = Joi.object({
	title: Joi.string().min(3).max(64).required(),
	description: Joi.string().max(256),
	imageUrl: Joi.string().max(128),
	startingPrice: Joi.number().min(5).required(),
	isBiddable: Joi.boolean().required(),
	expiresOn: Joi.date(),
	authorization: Joi.object(),
});

export const updateListingSchema = Joi.object({
	title: Joi.string().min(3).max(64),
	description: Joi.string().max(256),
	imageUrl: Joi.string().max(128),
	authorization: Joi.object(),
});
