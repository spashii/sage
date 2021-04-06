import Joi from 'joi';

export interface IUser {
	id: string;
	username: string;
	email: string;
	password: string;
}

export const registerSchema = Joi.object({
	username: Joi.string().alphanum().min(3).max(32).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
	email: [
		Joi.string().email().required(),
		Joi.string().alphanum().min(3).max(32).required(),
	],
	password: Joi.string().min(6).required(),
});
