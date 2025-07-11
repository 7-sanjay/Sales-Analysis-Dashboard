const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productName: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    price: { type: Number, default: 0 },
    netPrice: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'inventory' });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory; 