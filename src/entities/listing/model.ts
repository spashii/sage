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
	bidExpiresOn?: Date;
}

export const addListingSchema = Joi.object({
	title: Joi.string().min(3).max(64).required(),
	description: Joi.string().max(256),
	imageUrl: Joi.string().max(128),
	startingPrice: Joi.number().required(),
	isBiddable: Joi.boolean().required(),
	bidExpiresOn: Joi.date(),
	authorization: Joi.object(),
});
