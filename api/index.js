const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

app.get('/api/covid', cors(), (req, res) => {
    res.sendFile(path.join(__dirname, 'covid.json'));
});

app.listen(3000, () => {
    console.log('Server is running');
});
