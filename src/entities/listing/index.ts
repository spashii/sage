import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import db from '../../database';
import { IListing } from './model';

async function getAllListings(_req: Request, res: Response) {
	// limit to max 256
	try {
		const [rows] = await db.query(
			'SELECT * FROM listing ORDER BY timestamp DESC LIMIT 256'
		);
		return res.status(200).send(rows);
	} catch (err) {
		return res
			.status(500)
			.json({ message: `Some error occurred(${err.message})` });
	}
}

async function getListing(req: Request, res: Response) {
	const { id } = req.params;

	try {
		const [rows]: any = await db.query('SELECT * FROM listing WHERE id=?', [
			id,
		]);

		// if db doesn't contain the listing
		if (rows.length === 0) {
			return res.status(400).json({ message: 'This listing does not exist' });
		}

		// get the listing from the query result
		const listing: IListing = rows[0];
		return res.status(200).send(listing);
	} catch (err) {
		return res
			.status(500)
			.json({ message: `Some error occurred(${err.message})` });
	}
}

async function addListing(req: Request, res: Response) {
	const {
		title,
		description,
		imageUrl,
		startingPrice,
		isBiddable,
		bidExpiresOn,
		authorization,
	} = req.body;

	const listing: IListing = {
		id: uuid(),
		userId: authorization.id,
		timestamp: new Date(),
		title,
		description: description ? description : null,
		imageUrl: imageUrl ? imageUrl : null,
		startingPrice,
		isBiddable,
		bidCurrentPrice: isBiddable ? startingPrice : null,
		bidExpiresOn: isBiddable
			? bidExpiresOn
				? bidExpiresOn
				: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			: null,
	};
	console.log(listing);
	try {
		await db.query('INSERT INTO listing SET ?', [listing]);
	} catch (err) {
		return res
			.status(500)
			.json({ message: `Some error occurred(${err.message})` });
	}

	return res
		.status(200)
		.json({ message: 'Added successfully', id: listing.id });
}

export { getAllListings, getListing, addListing };