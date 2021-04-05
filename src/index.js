const express = require('express');
const db = require('./database');

const app = express();

app.set('view engine', 'ejs');

// import routers
const authRouter = require('./routes/auth');

// middleware
app.use(express.json());
app.use('/api/user', authRouter);

app.post('/get-time', async (req, res) => {
	const [rows, fields] = await db.query('SELECT id FROM __test');
	res.json({ rows, fields, hm: req.headers });
});

app.post('/add-time', async (_req, res) => {
	const [rows, fields] = await db.query('INSERT INTO __test SET ?', {
		id: new Date(),
	});
	res.json({ rows, fields });
});

app.listen(3000, async () => {
	console.log('server has started');
});
