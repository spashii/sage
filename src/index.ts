import * as express from 'express';
import morgan from 'morgan';

import dotenv from 'dotenv';
dotenv.config();

const app = express.default();

// import routers
import user from './entities/user/router';
import listing from './entities/listing/router';
import bidding from './entities/bidding/router';

// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/user', user);
app.use('/api/listing', listing);
app.use('/api/bidding', bidding);

import db from './database';
import protectedRouteWithUnauthorizedHandler from './middleware/protectedRouteWithUnauthorizedHandler';
(() => {
	app.get('/time', async (_req, res) => {
		const [rows] = await db.query('SELECT id FROM __test');
		res.json({ rows });
	});

	app.post(
		'/time',
		protectedRouteWithUnauthorizedHandler((_req, res) => {
			res.send('unauth handled');
		}),
		async (req, res) => {
			const [rows] = await db.query('INSERT INTO __test SET ?', {
				id: new Date(),
			});
			res.json({ rows, user: req.body.authorization });
		}
	);
})();

app.listen(3000, async () => {
	console.log('Server has started');
});
