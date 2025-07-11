require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');

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

// New analytics endpoint for detailed insights
app.get('/api/analytics', async (req, res) => {
  try {
    const products = await Product.find();
    
    if (products.length === 0) {
      return res.json({
        message: 'No data available for analysis',
        summary: {
          totalProducts: 0,
          totalRevenue: 0,
          totalProfit: 0,
          totalUnits: 0
        }
      });
    }

    // Calculate comprehensive analytics
    const totalRevenue = products.reduce((sum, p) => sum + (p.totalSales || 0), 0);
    const totalProfit = products.reduce((sum, p) => sum + (p.profit || 0), 0);
    const totalUnits = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const averagePrice = products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length;
    const averageProfit = products.reduce((sum, p) => sum + (p.profit || 0), 0) / products.length;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Category analysis
    const categories = [...new Set(products.map(p => p.category))];
    const categoryAnalysis = {};
    categories.forEach(category => {
      const categoryProducts = products.filter(p => p.category === category);
      const categoryRevenue = categoryProducts.reduce((sum, p) => sum + (p.totalSales || 0), 0);
      const categoryProfit = categoryProducts.reduce((sum, p) => sum + (p.profit || 0), 0);
      const categoryUnits = categoryProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
      
      categoryAnalysis[category] = {
        count: categoryProducts.length,
        totalRevenue: categoryRevenue,
        totalProfit: categoryProfit,
        totalUnits: categoryUnits,
        averagePrice: categoryProducts.reduce((sum, p) => sum + (p.price || 0), 0) / categoryProducts.length,
        averageProfit: categoryProfit / categoryProducts.length,
        averageQuantity: categoryUnits / categoryProducts.length,
        profitMargin: categoryRevenue > 0 ? (categoryProfit / categoryRevenue) * 100 : 0,
        revenueShare: (categoryRevenue / totalRevenue) * 100,
        profitShare: (categoryProfit / totalProfit) * 100,
        products: categoryProducts.map(p => p.productName)
      };
    });

    // Location analysis
    const locations = [...new Set(products.map(p => p.location))];
    const locationAnalysis = {};
    locations.forEach(location => {
      const locationProducts = products.filter(p => p.location === location);
      const locationRevenue = locationProducts.reduce((sum, p) => sum + (p.totalSales || 0), 0);
      const locationProfit = locationProducts.reduce((sum, p) => sum + (p.profit || 0), 0);
      const locationUnits = locationProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
      
      locationAnalysis[location] = {
        count: locationProducts.length,
        totalRevenue: locationRevenue,
        totalProfit: locationProfit,
        totalUnits: locationUnits,
        averagePrice: locationProducts.reduce((sum, p) => sum + (p.price || 0), 0) / locationProducts.length,
        averageProfit: locationProfit / locationProducts.length,
        averageQuantity: locationUnits / locationProducts.length,
        profitMargin: locationRevenue > 0 ? (locationProfit / locationRevenue) * 100 : 0,
        revenueShare: (locationRevenue / totalRevenue) * 100,
        profitShare: (locationProfit / totalProfit) * 100
      };
    });

    // Top performers
    const bestSellingProduct = products.reduce((best, current) => 
      (current.totalSales > best.totalSales) ? current : best, { totalSales: 0, productName: 'N/A' });
    
    const mostProfitableProduct = products.reduce((best, current) => 
      (current.profit > best.profit) ? current : best, { profit: 0, productName: 'N/A' });
    
    const highestPricedProduct = products.reduce((best, current) => 
      (current.price > best.price) ? current : best, { price: 0, productName: 'N/A' });
    
    const mostSoldProduct = products.reduce((best, current) => 
      (current.quantity > best.quantity) ? current : best, { quantity: 0, productName: 'N/A' });

    // Time analysis
    const timeAnalysis = {
      hourlySales: Array(24).fill(0),
      dailySales: {},
      monthlySales: {}
    };

    products.forEach(product => {
      if (product.time) {
        const date = new Date(product.time);
        if (!isNaN(date)) {
          const hour = date.getHours();
          const day = date.toDateString();
          const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
          
          timeAnalysis.hourlySales[hour] += (product.totalSales || 0);
          timeAnalysis.dailySales[day] = (timeAnalysis.dailySales[day] || 0) + (product.totalSales || 0);
          timeAnalysis.monthlySales[month] = (timeAnalysis.monthlySales[month] || 0) + (product.totalSales || 0);
        }
      }
    });

    // Statistical measures
    const priceRange = {
      min: Math.min(...products.map(p => p.price || 0)),
      max: Math.max(...products.map(p => p.price || 0)),
      median: products.map(p => p.price || 0).sort((a, b) => a - b)[Math.floor(products.length / 2)]
    };

    const profitRange = {
      min: Math.min(...products.map(p => p.profit || 0)),
      max: Math.max(...products.map(p => p.profit || 0)),
      median: products.map(p => p.profit || 0).sort((a, b) => a - b)[Math.floor(products.length / 2)]
    };

    const quantityRange = {
      min: Math.min(...products.map(p => p.quantity || 0)),
      max: Math.max(...products.map(p => p.quantity || 0)),
      median: products.map(p => p.quantity || 0).sort((a, b) => a - b)[Math.floor(products.length / 2)]
    };

    const analytics = {
      summary: {
        totalProducts: products.length,
        totalRevenue,
        totalProfit,
        totalUnits,
        averagePrice,
        averageProfit,
        profitMargin,
        categories: categories.length,
        locations: locations.length
      },
      categoryAnalysis,
      locationAnalysis,
      topPerformers: {
        bestSellingProduct,
        mostProfitableProduct,
        highestPricedProduct,
        mostSoldProduct
      },
      timeAnalysis,
      statistics: {
        priceRange,
        profitRange,
        quantityRange
      },
      dateRange: {
        earliest: new Date(Math.min(...products.map(p => new Date(p.time || p.createdAt)))),
        latest: new Date(Math.max(...products.map(p => new Date(p.time || p.createdAt))))
      }
    };

    res.json(analytics);
  } catch (err) {
    console.error('Error generating analytics:', err);
    res.status(500).json({ message: 'Error generating analytics' });
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

// --- Inventory Routes ---
// Get all inventory (products.inventory collection)
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching inventory', error: err.message });
  }
});

// Add or update inventory for a product in the master list (products.inventory collection)
app.post('/api/inventory', async (req, res) => {
  try {
    console.log('Received inventory data:', req.body);
    const { productName, category, stock, price = 0, netPrice = 0 } = req.body;
    // Upsert inventory document by productName and category
    const inventory = await Inventory.findOneAndUpdate(
      { productName, category },
      { $set: { stock, price, netPrice, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    console.log('Saved inventory document:', inventory);
    res.status(200).json(inventory);
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ message: 'Error updating inventory', error: err.message });
  }
});

// Reduce stock for a product (products.inventory collection)
app.post('/api/inventory/reduce', async (req, res) => {
  try {
    const { productName, category, quantity } = req.body;
    const inventory = await Inventory.findOne({ productName, category });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    if (inventory.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }
    inventory.stock -= quantity;
    inventory.updatedAt = new Date();
    await inventory.save();
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ message: 'Error reducing inventory', error: err.message });
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
