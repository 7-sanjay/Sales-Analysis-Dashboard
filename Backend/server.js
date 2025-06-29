require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const Product = require('./models/Product');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection 
console.log('Connecting to:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Model ---
const saleSchema = new mongoose.Schema({
  name: String,
  email: String,
  amount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Sale = mongoose.model('Sale', saleSchema);

// --- Product Routes ---
app.post('/api/products', async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    const product = new Product(req.body);
    const saved = await product.save();
    console.log('Product saved successfully:', saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving product:', err);
    res.status(500).json({ message: 'Error saving product data', error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('Update request received for ID:', req.params.id);
    console.log('Update data received:', req.body);
    console.log('Location in update data:', req.body.location);
    
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Product updated successfully:', product);
    console.log('Updated location in database:', product.location);
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Error updating product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

app.delete('/api/products', async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.json({ message: `Deleted ${result.deletedCount} products successfully` });
  } catch (err) {
    console.error('Error deleting all products:', err);
    res.status(500).json({ message: 'Error deleting all products' });
  }
});

// --- Sales Routes (keeping for compatibility) ---
app.post('/api/sales', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const sale = new Sale(req.body);
    const saved = await sale.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving sale:', err);
    res.status(500).json({ message: 'Error saving sale data' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
