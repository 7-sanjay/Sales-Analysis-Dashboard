const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number },
    productName: { type: String, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    netPrice: { type: Number, required: true },
    profit: { type: Number, default: 0 },
    category: { type: String, required: true },
    totalSales: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    location: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
