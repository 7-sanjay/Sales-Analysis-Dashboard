const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Sample product data for testing insights
const sampleProducts = [
  {
    productName: "Samsung 4K Smart TV",
    time: new Date('2024-01-15T10:30:00'),
    price: 45000,
    quantity: 5,
    netPrice: 35000,
    profit: 10000,
    totalSales: 225000,
    totalProfit: 50000,
    category: "Television",
    location: "United States"
  },
  {
    productName: "iPhone 15 Pro",
    time: new Date('2024-01-15T11:15:00'),
    price: 85000,
    quantity: 3,
    netPrice: 65000,
    profit: 20000,
    totalSales: 255000,
    totalProfit: 60000,
    category: "Electronics",
    location: "India"
  },
  {
    productName: "Sony Wireless Headphones",
    time: new Date('2024-01-15T12:00:00'),
    price: 12000,
    quantity: 8,
    netPrice: 9000,
    profit: 3000,
    totalSales: 96000,
    totalProfit: 24000,
    category: "Audio",
    location: "United Kingdom"
  },
  {
    productName: "MacBook Air M2",
    time: new Date('2024-01-15T13:45:00'),
    price: 95000,
    quantity: 2,
    netPrice: 75000,
    profit: 20000,
    totalSales: 190000,
    totalProfit: 40000,
    category: "Electronics",
    location: "Canada"
  },
  {
    productName: "LG OLED TV",
    time: new Date('2024-01-15T14:30:00'),
    price: 65000,
    quantity: 4,
    netPrice: 50000,
    profit: 15000,
    totalSales: 260000,
    totalProfit: 60000,
    category: "Television",
    location: "Australia"
  },
  {
    productName: "Bose Soundbar",
    time: new Date('2024-01-15T15:15:00'),
    price: 18000,
    quantity: 6,
    netPrice: 14000,
    profit: 4000,
    totalSales: 108000,
    totalProfit: 24000,
    category: "Audio",
    location: "Germany"
  },
  {
    productName: "iPad Pro 12.9",
    time: new Date('2024-01-15T16:00:00'),
    price: 75000,
    quantity: 4,
    netPrice: 60000,
    profit: 15000,
    totalSales: 300000,
    totalProfit: 60000,
    category: "Electronics",
    location: "France"
  },
  {
    productName: "Samsung Soundbar",
    time: new Date('2024-01-15T16:45:00'),
    price: 15000,
    quantity: 7,
    netPrice: 11000,
    profit: 4000,
    totalSales: 105000,
    totalProfit: 28000,
    category: "Audio",
    location: "Japan"
  },
  {
    productName: "Sony Bravia TV",
    time: new Date('2024-01-15T17:30:00'),
    price: 55000,
    quantity: 3,
    netPrice: 42000,
    profit: 13000,
    totalSales: 165000,
    totalProfit: 39000,
    category: "Television",
    location: "Brazil"
  },
  {
    productName: "AirPods Pro",
    time: new Date('2024-01-15T18:15:00'),
    price: 25000,
    quantity: 10,
    netPrice: 18000,
    profit: 7000,
    totalSales: 250000,
    totalProfit: 70000,
    category: "Audio",
    location: "South Africa"
  }
];

async function addSampleData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    console.log('Existing data cleared.');

    // Add sample products
    console.log('Adding sample products...');
    const savedProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully added ${savedProducts.length} sample products!`);

    // Display summary
    console.log('\n📊 Sample Data Summary:');
    console.log('========================');
    
    const totalRevenue = savedProducts.reduce((sum, p) => sum + p.totalSales, 0);
    const totalProfit = savedProducts.reduce((sum, p) => sum + p.totalProfit, 0);
    const totalUnits = savedProducts.reduce((sum, p) => sum + p.quantity, 0);
    
    console.log(`Total Products: ${savedProducts.length}`);
    console.log(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
    console.log(`Total Profit: ₹${totalProfit.toLocaleString('en-IN')}`);
    console.log(`Total Units Sold: ${totalUnits}`);
    
    // Category breakdown
    const categories = [...new Set(savedProducts.map(p => p.category))];
    console.log(`Categories: ${categories.join(', ')}`);
    
    // Location breakdown
    const locations = [...new Set(savedProducts.map(p => p.location))];
    console.log(`Locations: ${locations.join(', ')}`);
    
    console.log('\n✅ Sample data added successfully!');
    console.log('You can now test the data-driven insights feature in the visualization dashboard.');

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the script
addSampleData(); 