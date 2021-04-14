import * as express from 'express';

const router = express.Router();

import { protectedRoute, protectedRouteWithUnauthorizedHandler, validate } from '../../middleware';

import { getBiddings, addBidding, addBiddingStoredProc } from '.';
import { addBiddingSchema } from './model';

router.get('/:listingId', protectedRoute, getBiddings);
router.post('/:listingId', protectedRoute, validate(addBiddingSchema), addBiddingStoredProc);
// router.post('/:listingId', protectedRoute, validate(addBiddingSchema), addBidding);

export default router;
