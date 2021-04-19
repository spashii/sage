import * as express from 'express';

const router = express.Router();

import { protectedRoute, protectedRouteWithUnauthorizedHandler, validate } from '../../middleware';

import {
	getListing,
	getAllListingsWithBidCountAndUserName,
	getAllListings,
	addListing,
	getListingsByUser,
	updateListing,
	deleteListing,
	addListingStoredProc,
} from '.';
import { addListingSchema, updateListingSchema } from './model';

router.get('/', protectedRouteWithUnauthorizedHandler(getAllListings(false)), getAllListings(true));
// router.post('/', protectedRoute, validate(addListingSchema), addListing);
router.post('/', protectedRoute, validate(addListingSchema), addListingStoredProc);

router.get('/all', protectedRoute, getAllListingsWithBidCountAndUserName);

router.get('/:id', protectedRoute, getListing);
router.patch('/:id', protectedRoute, validate(updateListingSchema), updateListing);
router.delete('/:id', protectedRoute, deleteListing);

router.get('/by-user/:id', protectedRoute, getListingsByUser);

export default router;
