// todo: abstract model logic to model.ts

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import db from '../../database';
import { setAccessToken, setRefreshToken, verifyRefreshToken } from './jwt';
import { getUserData, updateUserTokenVersion, IUser } from './model';

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

		return res
			.status(500)
			.json({ message: `Some error occurred(${err.message})` });
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
		'SELECT id, username, email, password, tokenVersion FROM user WHERE (email=? OR username=?)',
		[email, email]
	);

	// if db doesn't contain the user
	if (rows.length === 0) {
		return res.status(400).json({ message: 'This account does not exist' });
	}

	// get the user from the query result
	const user: IUser = rows[0];
	const passwordIsValid = await bcrypt.compare(password, user.password!);

	// if password invalid
	if (!passwordIsValid) {
		return res.status(400).json({ message: 'Wrong Password' });
	}

	// handling tokens
	setAccessToken({ id: user.id }, res);
	setRefreshToken({ id: user.id, tokenVersion: user.tokenVersion }, res);

	return res.status(200).json({
		message: `Successful Login as ${user.username}`,
		user: { ...user, password: '' },
	});
}

async function refreshToken(req: Request, res: Response) {
	const token = req.cookies.aid;
	if (!token) {
		return res.status(400).json({ message: 'Refresh token not found' });
	}

	try {
		// will throw error if verification fails
		const payload = verifyRefreshToken(token);

		// validating the user record
		const user = await getUserData(payload.id);

		// checking if refresh token version is current
		if (user!.tokenVersion !== payload.tv) {
			return res
				.status(400)
				.json({ message: 'Refresh token is invalid (version mismatch)' });
		}

		// refresh the "refresh token"
		setRefreshToken({ id: payload.id, tokenVersion: user?.tokenVersion }, res);
		const accessToken = setAccessToken({ id: payload.id }, res);

		// returns new access token
		return res.status(200).json({ accessToken });
	} catch (err) {
		return res
			.status(400)
			.json({ message: `Refresh token is invalid (${err.message})` });
	}
}

async function revokeRefreshToken(req: Request, res: Response) {
	const { id } = req.body.authorization;

	const success = await updateUserTokenVersion(id);

	if (success) {
		return res.status(200).json({ message: 'Successful' });
	} else {
		return res.status(400).json({ message: 'Unsuccessful' });
	}
}

export { register, login, refreshToken, revokeRefreshToken };
