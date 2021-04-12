import Joi from 'joi';
import db from '../../database';

export interface IUser {
	id: string;
	username: string;
	email: string;
	password?: string;
	tokenVersion?: number;
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

export async function getUserData(id: number): Promise<IUser | null> {
	try {
		const [
			rows,
		]: any = await db.query('SELECT id, tokenVersion from user where id=?', [
			id,
		]);
		if (rows.length === 0) {
			return null;
		}
		return rows[0];
	} catch (err) {
		return null;
	}
}

export async function updateUserTokenVersion(id: number): Promise<boolean> {
	try {
		await db.query('UPDATE users SET tokenVersion=tokenVersion+1 WHERE id=?', [
			id,
		]);
		return true;
	} catch (err) {
		return false;
	}
}
