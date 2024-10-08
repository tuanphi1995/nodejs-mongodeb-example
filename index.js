const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseKey.json'); // Nạp file JSON từ firebaseKey.json

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore(); // Initialize Firestore
console.log('Connected to Firestore');

const app = express();
const port = 3000;

// Middleware để parse JSON
app.use(express.json());

// 1. API liệt kê tất cả items
app.get('/items', async (req, res) => {
  try {
    const itemsSnapshot = await db.collection('items').get();
    const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Lấy chi tiết item theo id
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

// 3. Cập nhật item theo id
app.put('/items/:id', async (req, res) => {
  const { name, description, price } = req.body;
  
  if (!name || !description || !price) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const itemRef = db.collection('items').doc(req.params.id);
    await itemRef.update({
      name,
      description,
      price
    });
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. Thêm item mới
app.post('/items', async (req, res) => {
  const { name, description, price } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!name || !description || !price) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newItem = { name, description, price };

  try {
    const addedItem = await db.collection('items').add(newItem);
    res.status(201).json({ id: addedItem.id, ...newItem });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. Xóa item theo id
app.delete('/items/:id', async (req, res) => {
  try {
    const itemRef = db.collection('items').doc(req.params.id);
    const itemDoc = await itemRef.get();
    
    if (!itemDoc.exists) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await itemRef.delete();
    res.json({ message: `Item ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
