import * as express from 'express';

const router = express.Router();

import { validate } from '../../middleware/validation';
import protectedRoute from '../../middleware/protectedRoute';
import { getListing, getAllListings, addListing } from '.';
import { addListingSchema } from './model';

router.get('/', getAllListings);
router.get('/:id', protectedRoute, getListing);
router.post('/', protectedRoute, validate(addListingSchema), addListing);

export default router;
