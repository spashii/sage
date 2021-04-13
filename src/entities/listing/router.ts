import * as express from 'express';

const router = express.Router();

import {
	protectedRoute,
	protectedRouteWithUnauthorizedHandler,
	validate,
} from '../../middleware';

import {
	getListing,
	getAllListings,
	addListing,
	getListingsByUser,
	getAllListingsUnauthorized,
	updateListing,
	deleteListing,
} from '.';
import { addListingSchema, updateListingSchema } from './model';

router.get(
	'/',
	protectedRouteWithUnauthorizedHandler(getAllListingsUnauthorized),
	getAllListings
);
router.post('/', protectedRoute, validate(addListingSchema), addListing);

router.get('/:id', protectedRoute, getListing);
router.patch(
	'/:id',
	protectedRoute,
	validate(updateListingSchema),
	updateListing
);
router.delete('/:id', protectedRoute, deleteListing);

router.get('/by-user/:id', protectedRoute, getListingsByUser);

export default router;
