require('dotenv').config({ quiet: true });
const express = require('express');
const app = express();

// Import and start all cron jobs
require('./cron');

app.use(express.json());

// Import and use the main router
const routes = require('./routes');
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send({ message: 'API is working' });
});

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});
