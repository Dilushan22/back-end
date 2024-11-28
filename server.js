const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // Import MongoClient and ObjectId
require('dotenv').config();

const app = express(); // Initialize Express app
const PORT = process.env.PORT || 3000; // Define backend port
app.use(express.json()); // Middleware to parse incoming JSON requests

// Enable CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
    );
    next();
});

// MongoDB Connection URI
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'; // Fallback to local MongoDB
let db;

// Connect to MongoDB
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
    .then(client => {
        db = client.db('webstore'); // Connect to the 'Webstore' database
        console.log('Connected to MongoDB');

        // Start the server once MongoDB is connected
        app.listen(PORT, () => {
            console.log(Backend server is running at http://localhost:${PORT});
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });

// Home Route
app.get('/', (req, res) => {
    res.send('Welcome to the webstore API! Try /products or /orders');
});

// Products API
app.get('/products', async (req, res) => {
    try {
        const products = await db.collection('Products').find({}).toArray();
        res.json(products); // Send products as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/products', async (req, res) => {
    try {
        const result = await db.collection('Products').insertOne(req.body);
        res.status(201).json(result.ops[0]); // Send the created product
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/products/:id', async (req, res) => {
    const productId = req.params.id;

    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    try {
        const result = await db.collection('Products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: req.body }
        );
        res.json(result.matchedCount === 1 ? { msg: 'Success' } : { msg: 'Product not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/products/:id', async (req, res) => {
    const productId = req.params.id;

    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    try {
        const result = await db.collection('Products').deleteOne({ _id: new ObjectId(productId) });
        res.json(result.deletedCount === 1 ? { msg: 'Success' } : { msg: 'Product not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Orders API
app.get('/orders', async (req, res) => {
    try {
        const orders = await db.collection('Orders').find({}).toArray();
        res.json(orders); // Send orders as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const result = await db.collection('Orders').insertOne(req.body);
        res.status(201).json(result.ops[0]); // Send the created order
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.put('/orders/:id', async (req, res) => {
    const orderId = req.params.id;

    if (!ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }

    try {
        const result = await db.collection('Orders').updateOne(
            { _id: new ObjectId(orderId) },
            { $set: req.body }
        );
        res.json(result.matchedCount === 1 ? { msg: 'Success' } : { msg: 'Order not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

app.delete('/orders/:id', async (req, res) => {
    const orderId = req.params.id;

    if (!ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }

    try {
        const result = await db.collection('Orders').deleteOne({ _id: new ObjectId(orderId) });
        res.json(result.deletedCount === 1 ? { msg: 'Success' } : { msg: 'Order not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'An error occurred, please try again later.' });
});

module.exports = app; // Export the app for testing or further use