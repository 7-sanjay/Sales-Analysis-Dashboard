const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
require('dotenv').config();

// Product price data
const priceData = [
  // Smartphones
  { category: 'Smartphones', productName: 'Samsung Galaxy S25 Ultra', price: 134999, netPrice: 118000 },
  { category: 'Smartphones', productName: 'iPhone 16', price: 129900, netPrice: 114000 },
  { category: 'Smartphones', productName: 'Redmi Note 15', price: 19999, netPrice: 16500 },
  { category: 'Smartphones', productName: 'Nothing Phone 3', price: 39999, netPrice: 34000 },
  { category: 'Smartphones', productName: 'OnePlus 13', price: 61999, netPrice: 52000 },
  // Laptops
  { category: 'Laptops', productName: 'MacBook Pro M3', price: 209900, netPrice: 185000 },
  { category: 'Laptops', productName: 'Asus ROG Strix G16', price: 144990, netPrice: 128000 },
  { category: 'Laptops', productName: 'Asus VivoBook 16X', price: 54990, netPrice: 48000 },
  { category: 'Laptops', productName: 'HP Spectre x360', price: 129999, netPrice: 113000 },
  { category: 'Laptops', productName: 'Dell XPS 15', price: 189999, netPrice: 168000 },
  // Tablets
  { category: 'Tablets', productName: 'iPad Pro M4', price: 149900, netPrice: 130000 },
  { category: 'Tablets', productName: 'Samsung Galaxy Tab S9', price: 89999, netPrice: 78000 },
  { category: 'Tablets', productName: 'Lenovo Tab P12 Pro', price: 54999, netPrice: 47000 },
  { category: 'Tablets', productName: 'Xiaomi Pad 6', price: 28999, netPrice: 24000 },
  { category: 'Tablets', productName: 'Realme Pad X', price: 19999, netPrice: 17000 },
  // Televisions
  { category: 'Televisions', productName: 'Sony Bravia 4K OLED', price: 239999, netPrice: 205000 },
  { category: 'Televisions', productName: 'Samsung QLED 8K', price: 329999, netPrice: 285000 },
  { category: 'Televisions', productName: 'LG NanoCell TV', price: 124999, netPrice: 108000 },
  { category: 'Televisions', productName: 'Mi Q1 55" QLED', price: 64999, netPrice: 57000 },
  { category: 'Televisions', productName: 'TCL 4K Smart TV', price: 49999, netPrice: 42000 },
  // Smartwatches
  { category: 'Smartwatches', productName: 'Apple Watch Series 10', price: 49999, netPrice: 43000 },
  { category: 'Smartwatches', productName: 'Samsung Galaxy Watch 7', price: 39999, netPrice: 34000 },
  { category: 'Smartwatches', productName: 'Noise ColorFit Ultra 3', price: 3999, netPrice: 3000 },
  { category: 'Smartwatches', productName: 'Fitbit Versa 4', price: 17999, netPrice: 15000 },
  { category: 'Smartwatches', productName: 'Amazfit GTS 5', price: 12999, netPrice: 10500 },
  // Headphones
  { category: 'Headphones', productName: 'Sony WH-1000XM6', price: 29999, netPrice: 25000 },
  { category: 'Headphones', productName: 'Bose QuietComfort Ultra', price: 34999, netPrice: 29000 },
  { category: 'Headphones', productName: 'JBL Tune 770NC', price: 6999, netPrice: 5000 },
  { category: 'Headphones', productName: 'Sennheiser Momentum 4', price: 26999, netPrice: 22500 },
  { category: 'Headphones', productName: 'OnePlus Buds Pro 2', price: 11999, netPrice: 10000 },
  // Chargers & Cables
  { category: 'Chargers & Cables', productName: 'Anker 65W GaN Charger', price: 3999, netPrice: 3200 },
  { category: 'Chargers & Cables', productName: 'Apple MagSafe Charger', price: 4500, netPrice: 3800 },
  { category: 'Chargers & Cables', productName: 'Samsung 45W Super Fast Charger', price: 2999, netPrice: 2400 },
  { category: 'Chargers & Cables', productName: 'UGREEN USB-C to Lightning Cable', price: 1499, netPrice: 1000 },
  { category: 'Chargers & Cables', productName: 'boAt 100W Type-C Cable', price: 799, netPrice: 600 },
  // Gaming Consoles
  { category: 'Gaming Consoles', productName: 'PlayStation 5', price: 54990, netPrice: 48000 },
  { category: 'Gaming Consoles', productName: 'Xbox Series X', price: 52999, netPrice: 46000 },
  { category: 'Gaming Consoles', productName: 'Nintendo Switch OLED', price: 38999, netPrice: 33000 },
  { category: 'Gaming Consoles', productName: 'Logitech G Cloud', price: 29999, netPrice: 25000 },
  { category: 'Gaming Consoles', productName: 'Steam Deck', price: 49999, netPrice: 43000 },
  // Camera & Accessories
  { category: 'Camera & Accessories', productName: 'Canon EOS R7 Mirrorless', price: 139999, netPrice: 120000 },
  { category: 'Camera & Accessories', productName: 'Sony Alpha ZV-E10', price: 74999, netPrice: 63000 },
  { category: 'Camera & Accessories', productName: 'Nikon Z6 II', price: 179999, netPrice: 155000 },
  { category: 'Camera & Accessories', productName: 'GoPro Hero 12', price: 42999, netPrice: 36000 },
  { category: 'Camera & Accessories', productName: 'DJI OM 6 Gimbal', price: 12999, netPrice: 11000 },
];

async function updateInventoryPrices() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB!');

    let updatedCount = 0;
    for (const item of priceData) {
      const res = await Inventory.findOneAndUpdate(
        { productName: item.productName, category: item.category },
        { $set: { price: item.price, netPrice: item.netPrice, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      if (res) updatedCount++;
      console.log(`Updated: ${item.category} - ${item.productName} | Price: ₹${item.price}, Net Price: ₹${item.netPrice}`);
    }
    console.log(`\n✅ Updated prices for ${updatedCount} inventory items.`);
  } catch (err) {
    console.error('Error updating inventory prices:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

updateInventoryPrices(); 