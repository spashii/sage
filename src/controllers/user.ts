// refactor
// abstract away creating tokens
// abstract away validation logic

import { Request, Response } from 'express';

import db from '../database';

import Joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import jwt from 'jsonwebtoken';

interface IUser {
	id: string;
	username: string;
	email: string;
	password: string;
}

const registerSchema = Joi.object({
	username: Joi.string().alphanum().min(3).max(32).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

async function register(req: Request, res: Response) {
	const { username, email, password } = req.body;

	const { error } = registerSchema.validate({
		username,
		email,
		password,
	});

	if (error) {
		res.status(400).json({ message: error?.message });
		return;
	}

	const user: IUser = {
		id: uuid(),
		username,
		email,
		password: await bcrypt.hash(password, 10),
	};

	try {
		await db.query('INSERT INTO user SET ?', [user]);
		res.status(200).json({ message: 'Registered successfully', id: user.id });
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			res
				.status(400)
				.json({ message: 'Account with same email/username already exists' });
		} else {
			res.status(500).json({ message: 'Some error occured' });
		}
	}
}

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

async function login(req: Request, res: Response) {
	const { email, password } = req.body;

	const { error } = loginSchema.validate({
		email,
		password,
	});

	if (error) {
		res.status(400).json({ message: error?.message });
		return;
	}

	const [
		rows,
	]: any = await db.query(
		'SELECT id, username, email, password FROM user WHERE email=?',
		[email]
	);

	if (rows.length === 0) {
		res.status(400).json({ message: 'This account does not exist' });
	} else {
		const user: IUser = rows[0];

		const passwordIsValid = await bcrypt.compare(password, user.password);

		if (!passwordIsValid) {
			res.status(400).json({ message: 'Wrong Password' });
		} else {
			const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
				expiresIn: '15m',
			});

			res.cookie(
				'aid',
				jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, {
					expiresIn: '7d',
				}),
				{ httpOnly: true, expires: new Date(Date.now() + 604800000) }
			);

			res
				.status(200)
				.header('Authorization', token)
				.json({
					message: `Successful Login as ${user.username}`,
					token,
					user: { ...user, password: '' },
				});
		}
	}
}

async function refreshToken(req: Request, res: Response) {
	const token = req.cookies.aid;
	if (!token) {
		res.status(400).json({ message: 'Refresh cookie not found' });
	}

	try {
		const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
		const [rows]: any = await db.query('SELECT id from user where id=?', [
			payload.id,
		]);
		if (rows.length === 0) {
			throw new Error('User Not Found');
		}

		res.cookie(
			'aid',
			jwt.sign({ id: payload.id }, process.env.JWT_REFRESH_SECRET!, {
				expiresIn: '7d',
			}),
			{ httpOnly: true, expires: new Date(Date.now() + 604800000) }
		);

		const newToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET!, {
			expiresIn: '15m',
		});
		return res.status(200).json({ token: newToken });
	} catch (err) {
		console.log(err);
		return res.status(400).json({ message: 'Invalid token' });
	}
}

export { register, login, refreshToken };
