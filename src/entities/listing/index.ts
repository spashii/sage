import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import db from '../../database';
import { IListing } from './model';

async function getAllListingsUnauthorized(_req: Request, res: Response) {
	// limit to max 256
	try {
		const [rows] = await db.query(
			'SELECT * FROM listing ORDER BY timestamp DESC LIMIT 20'
		);
		return res.status(200).send(rows);
	} catch (err) {
		return res
			.status(500)
			.json({ message: `Some error occurred(${err.message})` });
	}
}

async function getAllListings(_req: Request, res: Response) {
	// limit to max 256
	try {
		const [rows] = await db.query(
			'SELECT * FROM listing ORDER BY timestamp DESC'
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

async function updateListing(req: Request, res: Response) {
	const { id } = req.params;

	const { title, description, imageUrl, authorization } = req.body;

	const payload = {
		title,
		description,
		imageUrl,
	};

	// removing null entries from the payload object, to avoid null mutation
	const cleanPayload = Object.keys(payload)
		.filter((k) => payload[k] != null)
		.reduce((a, k) => ({ ...a, [k]: payload[k] }), {});

	try {
		// only listing owner should be able to update
		const [
			rows,
		]: any = await db.query('UPDATE listing SET ? WHERE id=? AND userId=?', [
			cleanPayload,
			id,
			authorization.id,
		]);

		if (rows.affectedRows === 1)
			return res.status(200).json({ message: 'Updated successfully' });
		else return res.status(400).json({ message: 'Update unsuccessful' });

		// get the listing from the query result
	} catch (err) {
		return res
			.status(500)
			.json({ message: `Some error occurred(${err.message})` });
	}
}

async function deleteListing(req: Request, res: Response) {
	const { id } = req.params;

	const { authorization } = req.body;

	try {
		// only listing owner should be able to delete
		const [
			rows,
		]: any = await db.query('DELETE FROM listing WHERE id=? AND userId=?', [
			id,
			authorization.id,
		]);

		if (rows.affectedRows === 1)
			return res.status(200).json({ message: 'Deleted successfully' });
		else return res.status(400).json({ message: 'Delete unsuccessful' });

		// get the listing from the query result
	} catch (err) {
		return res
			.status(500)
			.json({ message: `Some error occurred(${err.message})` });
	}
}

async function getListingsByUser(req: Request, res: Response) {
	const { id } = req.params;

	try {
		const [rows]: any = await db.query('SELECT * FROM listing WHERE userId=?', [
			id,
		]);

		// if db doesn't contain the listings
		if (rows.length === 0) {
			const [user]: any = await db.query('SELECT id FROM user WHERE id=?', [
				id,
			]);

			if (user.length === 0) {
				return res.status(400).json({ message: `User doesn't exist` });
			}

			return res.status(400).json({ message: `User has no listings` });
		}

		// get the listing from the query result
		const listings: IListing[] = rows;
		return res.status(200).send(listings);
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

export {
	getAllListingsUnauthorized,
	getAllListings,
	getListing,
	updateListing,
	deleteListing,
	getListingsByUser,
	addListing,
};
