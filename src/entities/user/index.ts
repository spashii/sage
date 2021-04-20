// todo: abstract model logic to model.ts

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import db from '../../database';
import { clearRefreshToken, setAccessToken, setRefreshToken, verifyRefreshToken } from './jwt';
import { getUserData, updateUserTokenVersion, IUser } from './model';
import { omit, genericServerErrorResponse, genericInvalidResponse } from '../../util';

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
			return genericInvalidResponse(res, 'Account with same email/username already exists');
		}

		return genericServerErrorResponse(res, err);
	}

	// handling tokens
	setAccessToken({ id: user.id }, res);
	setRefreshToken({ id: user.id, tokenVersion: 0 }, res);

	return res.status(200).json({ message: 'Registered successfully', id: user.id });
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
		return genericInvalidResponse(res, 'This account does not exist');
	}

	// get the user from the query result
	const user: IUser = rows[0];
	const passwordIsValid = await bcrypt.compare(password, user.password!);

	// if password invalid
	if (!passwordIsValid) {
		return genericInvalidResponse(res, 'Wrong Password');
	}

	// handling tokens
	setAccessToken({ id: user.id }, res);
	setRefreshToken({ id: user.id, tokenVersion: user.tokenVersion }, res);

	return res.status(200).json({
		message: `Successful Login as ${user.username}`,
		user: { ...omit(user, ['password']) },
	});
}

async function refreshToken(req: Request, res: Response) {
	const token = req.cookies.aid;
	if (!token) {
		return genericInvalidResponse(res, 'Refresh token not found');
	}

	try {
		// will throw error if verification fails
		const payload = verifyRefreshToken(token);

		// validating the user record
		const user = await getUserData(payload.id);

		// checking if refresh token version is current
		if (user!.tokenVersion !== payload.tv) {
			return genericInvalidResponse(res, 'Refresh token is invalid', new Error('version mismatch'));
		}

		// refresh the "refresh token"
		setRefreshToken({ id: payload.id, tokenVersion: user?.tokenVersion }, res);
		const accessToken = setAccessToken({ id: payload.id }, res);

		// returns new access token
		return res.status(200).json({ accessToken });
	} catch (err) {
		return genericInvalidResponse(res, 'Refresh token is invalid', err);
	}
}

async function revokeRefreshToken(req: Request, res: Response) {
	const { id } = req.body.authorization;

	try {
		await updateUserTokenVersion(id);
		return res.status(200).json({ message: 'Successfully revoked refresh token' });
	} catch (err) {
		return genericInvalidResponse(res, 'Unsuccessful', err);
	}
}

async function getMe(req: Request, res: Response) {
	const { authorization } = req.body;

	try {
		const [userResult] = await db.query('SELECT * FROM user WHERE id=?', [authorization.id]);
		const [
			listingResult,
		] = await db.query('SELECT * FROM listingBidCountUserNameView WHERE userId=? ORDER BY timestamp DESC', [
			authorization.id,
		]);
		const [biddingResult] = await db.query('SELECT * FROM bidding WHERE userId=? ORDER BY timestamp DESC', [
			authorization.id,
		]);

		// returns user details with all its listings and biddings
		let user = { ...omit(userResult[0], ['password']), listings: listingResult, biddings: biddingResult };

		return res.status(200).send(user);
	} catch (err) {
		return genericServerErrorResponse(res, err);
	}
}

async function logout(_req: Request, res: Response) {
	clearRefreshToken(res);
	return res.status(200).json({ message: 'Logout successful' });
}

export { register, login, logout, refreshToken, revokeRefreshToken, getMe };
