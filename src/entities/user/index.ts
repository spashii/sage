import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import db from '../../database';
import { setAccessToken, setRefreshToken, verifyRefreshToken } from './jwt';
import { IUser } from './model';

async function register(req: Request, res: Response) {
	const { username, email, password } = req.body;

	const user: IUser = {
		id: uuid(),
		username,
		email,
		password: await bcrypt.hash(password, 10),
	};

	try {
		await db.query('INSERT INTO user SET ?', [user]);
	} catch (err) {
		// duplicate entry error
		if (err.code === 'ER_DUP_ENTRY') {
			return res.status(400).json({
				message: 'Account with same email/username already exists',
			});
		}

		return res.status(500).json({ message: 'Some error occured' });
	}

	return res
		.status(200)
		.json({ message: 'Registered successfully', id: user.id });
}

async function login(req: Request, res: Response) {
	// email or username works
	const { email, password } = req.body;

	const [
		rows,
	]: any = await db.query(
		'SELECT id, username, email, password FROM user WHERE (email=? OR username=?)',
		[email, email]
	);

	// if db doesn't contain the user
	if (rows.length === 0) {
		return res.status(400).json({ message: 'This account does not exist' });
	}

	// get the user from the query result
	const user: IUser = rows[0];
	const passwordIsValid = await bcrypt.compare(password, user.password);

	// if password invalid
	if (!passwordIsValid) {
		return res.status(400).json({ message: 'Wrong Password' });
	}

	// handling tokens
	setAccessToken({ id: user.id }, res);
	setRefreshToken({ id: user.id }, res);

	return res.status(200).json({
		message: `Successful Login as ${user.username}`,
		user: { ...user, password: '' },
	});
}

async function refreshToken(req: Request, res: Response) {
	const token = req.cookies.aid;
	if (!token) {
		return res.status(400).json({ message: 'Refresh cookie not found' });
	}

	try {
		// will throw error if verification fails
		const payload = verifyRefreshToken(token);

		// validating the user record
		const [rows]: any = await db.query('SELECT id from user where id=?', [
			payload.id,
		]);

		if (rows.length === 0) {
			throw new Error('User Not Found');
		}

		// refresh the "refresh token"
		setRefreshToken(payload, res);
		const accessToken = setAccessToken(payload, res);

		// returns new access token
		return res.status(200).json({ accessToken });
	} catch (err) {
		console.log(err);
		return res.status(400).json({ message: 'Invalid token' });
	}
}

export { register, login, refreshToken };
