import { Request, Response } from 'express';
import {
	customDatabaseProcedureResponse,
	genericInvalidResponse,
	genericServerErrorResponse,
} from '../../util';
import { v4 as uuid } from 'uuid';

import db from '../../database';
import { IListing } from './model';

// returns handler based on auth
function getAllListings(auth: boolean) {
	return async (_req: Request, res: Response) => {
		try {
			const [rows] = await db.query(
				`SELECT * FROM listing WHERE expiresOn >= NOW() ORDER BY timestamp DESC ${auth ? '' : 'LIMIT 20'}`
			);
			return res.status(200).send(rows);
		} catch (err) {
			return genericServerErrorResponse(res, err);
		}
	};
}

async function getListing(req: Request, res: Response) {
	const { id } = req.params;

	try {
		const [rows]: any = await db.query('SELECT * FROM listing WHERE id=?', [id]);

		// if db doesn't contain the listing
		if (rows.length === 0) {
			return genericInvalidResponse(res, 'This listing does not exist');
		}

		// get the listing from the query result
		const listing: IListing = rows[0];
		return res.status(200).send(listing);
	} catch (err) {
		return genericServerErrorResponse(res, err);
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
		const [rows]: any = await db.query('UPDATE listing SET ? WHERE id=? AND userId=?', [
			cleanPayload,
			id,
			authorization.id,
		]);

		if (rows.affectedRows === 1) return res.status(200).json({ message: 'Updated successfully' });
		else return genericInvalidResponse(res, 'Update unsuccessful');

		// get the listing from the query result
	} catch (err) {
		return genericServerErrorResponse(res, err);
	}
}

async function deleteListing(req: Request, res: Response) {
	const { id } = req.params;

	const { authorization } = req.body;

	try {
		// only listing owner should be able to delete
		const [rows]: any = await db.query('DELETE FROM listing WHERE id=? AND userId=?', [id, authorization.id]);

		if (rows.affectedRows === 1) return res.status(200).json({ message: 'Deleted successfully' });
		else return genericInvalidResponse(res, 'Delete unsuccessful');

		// get the listing from the query result
	} catch (err) {
		return genericServerErrorResponse(res, err);
	}
}

async function getListingsByUser(req: Request, res: Response) {
	const { id } = req.params;

	try {
		const [rows]: any = await db.query('SELECT * FROM listing WHERE userId=?', [id]);

		// if db doesn't contain the listings
		if (rows.length === 0) {
			const [user]: any = await db.query('SELECT id FROM user WHERE id=?', [id]);

			if (user.length === 0) {
				return genericInvalidResponse(res, `User doesn't exist`);
			}

			return genericInvalidResponse(res, `User has no listings`);
		}

		// get the listing from the query result
		const listings: IListing[] = rows;
		return res.status(200).send(listings);
	} catch (err) {
		return genericServerErrorResponse(res, err);
	}
}

async function addListingStoredProc(req: Request, res: Response) {
	const { title, description, imageUrl, startingPrice, isBiddable, expiresOn, authorization } = req.body;

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
		expiresOn: expiresOn ? expiresOn : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // + 14 days
	};

	try {
		const [rows]: any = await db.query('CALL addListingProc(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
			listing.id,
			listing.userId,
			listing.timestamp,
			listing.title,
			listing.description,
			listing.imageUrl,
			listing.startingPrice,
			listing.isBiddable,
			listing.bidCurrentPrice,
			listing.expiresOn,
		]);

		return customDatabaseProcedureResponse(res, rows, listing);
	} catch (err) {
		return genericServerErrorResponse(res, err);
	}
}

async function addListing(req: Request, res: Response) {
	const { title, description, imageUrl, startingPrice, isBiddable, expiresOn, authorization } = req.body;

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
		expiresOn: expiresOn ? expiresOn : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // + 14 days
	};
	try {
		await db.query('INSERT INTO listing SET ?', [listing]);
	} catch (err) {
		return genericServerErrorResponse(res, err);
	}

	return res.status(200).json({ message: 'Added successfully', id: listing.id });
}

export {
	getAllListings,
	getListing,
	updateListing,
	deleteListing,
	getListingsByUser,
	addListing,
	addListingStoredProc,
};
