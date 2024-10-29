const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let classes = [], bookings = [];

app.post('/api/classes', (req, res) => {
    classes = [...classes, ...req.body];
    res.status(201).json({ message: 'Classes created', classes });
});

app.get('/api/classes', (req, res) => {
    res.json(classes);
});

app.post('/api/bookings', (req, res) => {
    bookings.push(req.body);
    res.status(201).json({ message: 'Booking created', booking: req.body });
});

app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

app.listen(PORT, () => {
    console.log(`${PORT}`);
});
