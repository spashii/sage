import Joi from 'joi';

export interface IBidding {
	id: string;
	listingId: string;
	userId: string;
	bid: number;
	timestamp: Date;
}

export const addBiddingSchema = Joi.object({
	bid: Joi.number().integer().min(0).required(),
	authorization: Joi.object(),
});
