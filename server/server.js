 const express = require('express');
 const connectDB = require('./config/connection');

 const app = express();
 app.use(express.json());

 connectDB();

 app.get('/', (req, res) => {
    res.send('Backend server is running!');
 });

 const PORT = 5000;

 app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
 });