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
} from '.';
import { addListingSchema } from './model';

router.get(
	'/',
	protectedRouteWithUnauthorizedHandler(getAllListingsUnauthorized),
	getAllListings
);
router.post('/', protectedRoute, validate(addListingSchema), addListing);
router.get('/:id', protectedRoute, getListing);
router.get('/by-user/:id', protectedRoute, getListingsByUser);

export default router;
