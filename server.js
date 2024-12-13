// Import dependencies modules:
const express = require('express')
// const bodyParser = require('body-parser')

var path = require("path");


// Create an Express.js instance:
const app = express()
// config Express.js
app.use(express.json())
app.set('port', 3000)
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
})

// connect to MongoDB
const MongoClient = require('mongodb').MongoClient;

let db;

// MongoClient.connect('mongodb+srv://diluboii:Prince%402025@cluster0.kmsmh.mongodb.net/', (err, client) => {
//     db = client.db('webstore')
// })

MongoClient.connect('mongodb+srv://diluboii:Prince%402025@cluster0.kmsmh.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the application if the database connection fails
    }
    db = client.db('webstore');
    console.log('Connected to MongoDB');
});

//server static file
    var staticPath = path.resolve(__dirname,"images");
    app.use('/images',express.static(staticPath));

// File not found error handler for '/images' path
    app.use('/images', (req, res) => {
        res.status(404).send('File Not Found');
      });

// display a message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    if (!db) {
        return res.status(500).send('Database not connected');
    }
    req.collection = db.collection(collectionName);
    return next();
})


// retrieve all the objects from an collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})



//Adding a new post to a collection
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
    if (e) return next(e)
    res.send(results.ops)
    })
    })
    
    // return with object id 
    
    const ObjectID = require('mongodb').ObjectID;
    app.get('/collection/:collectionName/:id'
    , (req, res, next) => {
        //converts string id to mongodb object id formart
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
    if (e) return next(e)
    res.send(result)
    })
    })
    
    //update availability to specific products
    app.put('/collection/products/:id', async (req, res) => {
        const productId = req.params.id;
        const updatedAvailability = req.body.Availability;
    
        try {
            const result = await db.collection('products').updateOne(
                { id: productId }, // Match the product by ID
                { $set: { Availability: updatedAvailability } } // Update availability
            );
    
            if (result.modifiedCount === 0) {//checks count on modified documents
                return res.status(404).send('Product not found or already up-to-date.');
            }
    
            res.status(200).send({ success: true, message: 'Product updated' });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).send({ success: false, error: 'Database error' });
        }
    });
    
    
    
    // Delete an object from a collection by ID
    app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
    { _id: ObjectID(req.params.id) },(e, result) => {
    if (e) return next(e)
    res.send((result.result.n === 1) ?
    {msg: 'success'} : {msg: 'error'})
    })
    })
    
    
// Start the Express.js server
app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000')
})
