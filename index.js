const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/Items');

const app = express();
const port = 3000;


mongoose.connect('mongodb://localhost:27017/ecommerce_db')
.then(()=>{
    console.log('Connected to MongoDB');
})
.catch(err=>{
    console.log('Error connecting to MongoDB', err);
});

//Parer JSON -> dungf middleware

app.use(express.json());

//1. API liet ke tat ca cac items 
app.get('/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}); 
// lay chi tiet items theo id
app.get('/items/:id',async(req,res)=>{
    try {
        const item = await Item.findById(req.params.id);
        if(!item) return res.status(404).json({message:'Item not found'});
        res.json(item);
        
    } catch (error) {
        res.status(500).json({message:error.message});
        
    }

});

//3.cap nhat theo id
app.put('/items/:id', async(req, res)=>{
    if(!req.item) return res.status(404).json({ message: 'Item not found' });

    try {
        req.item.name = req.body.name;
        req.item.description = req.body.description;
        req.item.price = req.body.price;

        const updatedItem = await req.item.save();
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    
})

//4. them items moi
app.post('/items/:id', async (req, res) => {
    const item = new Item({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
    });

    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//5. xoa item theo id

app.delete('/items/:id', async()=>{
    const item = await Item.findByIdAndDelete(req.params.id);

    if(!item) return res.status(404).json({ message: 'Item not found' });

    res.json({ message: 'Item deleted' });
});


//caaus hinh soerver

app.listen(port, ()=>{
    console.log('Server is running on port http://localhost/${port}');
});

