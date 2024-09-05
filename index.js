const express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.CLIENT_EMAIL,
  }),
  databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore(); // Initialize Firestore

const app = express();
const port = 3000;

// Parse JSON -> use middleware
app.use(express.json());

// 1. API to list all items
app.get('/items', async (req, res) => {
  try {
    const itemsSnapshot = await db.collection('items').get();
    const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get item details by id
app.get('/items/:id', async (req, res) => {
  try {
    const itemDoc = await db.collection('items').doc(req.params.id).get();
    if (!itemDoc.exists) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(itemDoc.data());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Update item by id
app.put('/items/:id', async (req, res) => {
  try {
    const itemRef = db.collection('items').doc(req.params.id);
    await itemRef.update({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price
    });
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. Add new item
app.post('/items', async (req, res) => {
  const newItem = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price
  };

  try {
    const addedItem = await db.collection('items').add(newItem);
    res.status(201).json({ id: addedItem.id, ...newItem });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. Delete item by id
app.delete('/items/:id', async (req, res) => {
  try {
    const itemRef = db.collection('items').doc(req.params.id);
    const itemDoc = await itemRef.get();
    
    if (!itemDoc.exists) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await itemRef.delete();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
