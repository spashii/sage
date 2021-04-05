import * as express from 'express';
import db from './database';

import dotenv from 'dotenv';

dotenv.config();

const app = express.default();
app.set('view engine', 'ejs');

// import routers
import user from './routes/user';
import protectedRoute from './middleware/protectedRoute';

// middleware
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
