import * as express from 'express';
import morgan from 'morgan';

import dotenv from 'dotenv';
dotenv.config();

const app = express.default();

// import routers
import user from './entities/user/router';
import protectedRoute from './middleware/protectedRoute';

// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/user', user);

// app.post('/get-time', async (_req, res) => {
// 	const [rows] = await db.query('SELECT id FROM __test');
// 	res.json({ rows });
// });

// app.post('/add-time', protectedRoute, async (req, res) => {
// 	const [rows] = await db.query('INSERT INTO __test SET ?', {
// 		id: new Date(),
// 	});
// 	res.json({ rows, user: req.body.__user__ });
// });

app.listen(3000, async () => {
	console.log('server has started');
});
