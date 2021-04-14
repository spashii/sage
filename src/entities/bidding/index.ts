import { Request, Response } from 'express';
import AsyncLock from 'async-lock';

import {
	customDatabaseProcedureResponse,
	genericServerErrorResponse,
	genericInvalidResponse,
} from '../../util';
import { v4 as uuid } from 'uuid';

import db from '../../database';
import { IBidding } from './model';
import { IListing } from '../listing/model';

async function getBiddings(req: Request, res: Response) {
	const { listingId } = req.params;

	try {
		// checking if listing belongs to current user
		const [listings]: any = await db.query('SELECT userId from listing WHERE id=?', [listingId]);

		// if listing doesn't exist
		if (listings.length === 0) {
			return genericInvalidResponse(res, "Listing doesn't exist");
		}

		const { userId } = listings[0];
		if (userId !== req.body.authorization.id) {
			return res.status(401).json({ message: "This listing doesn't belong to you" });
		}

		// getting all the biddings
		const [
			biddings,
		]: any = await db.query('SELECT id, userId, listingId, bid, timestamp FROM bidding WHERE listingId=?', [
			listingId,
		]);

		return res.status(200).send(biddings);
	} catch (err) {
		return genericServerErrorResponse(res, err);
	}
}

async function addBiddingStoredProc(req: Request, res: Response) {
	const { listingId } = req.params;
	const { authorization, bid } = req.body;

	const bidding: IBidding = {
		id: uuid(),
		userId: authorization.id,
		listingId,
		bid,
		timestamp: new Date(),
	};

	try {
		const [rows]: any = await db.query('CALL addBiddingProc(?, ?, ?, ?, ?)', [
			bidding.id,
			bidding.userId,
			bidding.listingId,
			bidding.bid,
			bidding.timestamp,
		]);

		return customDatabaseProcedureResponse(res, rows, bidding);
	} catch (err) {
		return genericServerErrorResponse(res, err);
	}
}

// same function as above but checks are performed here instead of db
async function addBidding(req: Request, res: Response) {
	const { listingId } = req.params;
	const { authorization, bid } = req.body;

	try {
		// use locking per listing to prevent race condition while bidding
		const lock = new AsyncLock();

		return await lock.acquire(listingId, async () => {
			const [
				listings,
			]: any = await db.query(
				'SELECT id, userId, startingPrice, isSold, isBiddable, bidCurrentPrice, expiresOn from listing WHERE id=?',
				[listingId]
			);

			// if listing doesn't exist
			if (listings.length === 0) {
				return genericInvalidResponse(res, "Listing doesn't exist");
			}

			const listing: IListing = listings[0];

			// if listing has expired
			if (listing.isBiddable && listing.expiresOn!.getTime() < new Date().getTime()) {
				return genericInvalidResponse(res, 'Listing has expired');
			}

			// if listing is already sold
			if (listing.isSold) {
				return genericInvalidResponse(res, 'Listing has been sold');
			}

			// if current user is listing owner
			if (authorization.id === listing.userId) {
				return genericInvalidResponse(res, 'You cannot bid on your own listing');
			}

			const bidding: IBidding = {
				id: uuid(),
				userId: authorization.id,
				listingId,
				bid,
				timestamp: new Date(),
			};

			// handling different types of listings
			// biddable type
			if (listing.isBiddable) {
				// checking if current price of bid > than this bid
				if (listing.bidCurrentPrice! > bidding.bid) {
					return genericInvalidResponse(res, 'Your bid cannot be lower than the current bid');
				}

				// have to run these queries sequentially
				const connection = await db.getConnection();

				return connection
					.beginTransaction()
					.then(async () => {
						const [biddingResult]: any = await connection.query('INSERT INTO bidding SET ?', [bidding]);
						if (biddingResult.affectedRows !== 1) {
							throw new Error('Bidding not created');
						}

						const [
							listingResult,
						]: any = await connection.query('UPDATE listing SET bidCurrentPrice=? WHERE id=?', [
							bidding.bid,
							listing.id,
						]);
						if (listingResult.affectedRows !== 1) {
							throw new Error('Listing not updated');
						}

						await connection.commit();
						connection.release();
						return res.status(200).json({ message: 'Bid successful', bidding });
					})
					.catch(async (err) => {
						await connection.rollback();
						connection.release();
						return genericServerErrorResponse(res, err);
					});
			} else {
				// not of the biddable type
				// here, the "bidding" acts as the order
				if (listing.startingPrice !== bidding.bid) {
					return genericInvalidResponse(
						res,
						`Please tender exact change of ${listing.startingPrice}. I don't know why someone would even get this error unless they fkd something up on the frontend bad or someone jsut using this api, in that case hello to u, pls fix ur order and sned it to me agaain.`
					);
				}

				// at this point, we can sell the listing to the bidder (orderer)
				const connection = await db.getConnection();

				return connection
					.beginTransaction()
					.then(async () => {
						const [biddingResult]: any = await connection.query('INSERT INTO bidding SET ?', [bidding]);
						if (biddingResult.affectedRows !== 1) {
							throw new Error('Bidding not created');
						}

						const [
							listingResult,
						]: any = await connection.query('UPDATE listing SET isSold=1, soldBidId=? WHERE id=?', [
							bidding.id,
							listing.id,
						]);
						console.log(listingResult, bidding.id, listing.id);
						if (listingResult.affectedRows !== 1) {
							throw new Error('Listing not updated');
						}

						await connection.commit();
						connection.release();
						return res.status(200).json({ message: 'Order successful', bidding });
					})
					.catch(async (err) => {
						await connection.rollback();
						connection.release();
						return genericServerErrorResponse(res, err);
					});
			}
		});
	} catch (err) {
		return genericServerErrorResponse(res, err);
	}
}

export { getBiddings, addBidding, addBiddingStoredProc };
