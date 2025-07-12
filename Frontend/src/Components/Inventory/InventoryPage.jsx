import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InventoryPage.css';

const categoryOptions = [
    'Smartphones', 'Laptops', 'Tablets', 'Televisions',
    'Smartwatches', 'Headphones', 'Chargers & Cables',
    'Gaming Consoles', 'Camera & Accessories'
];

const productOptions = {
    'Smartphones': ['Samsung Galaxy S25 Ultra', 'iPhone 16', 'Redmi Note 15', 'Nothing Phone 3', 'OnePlus 13'],
    'Laptops': ['MacBook Pro M3', 'Asus ROG Strix G16', 'Asus VivoBook 16X', 'HP Spectre x360', 'Dell XPS 15'],
    'Tablets': ['iPad Pro M4', 'Samsung Galaxy Tab S9', 'Lenovo Tab P12 Pro', 'Xiaomi Pad 6', 'Realme Pad X'],
    'Televisions': ['Sony Bravia 4K OLED', 'Samsung QLED 8K', 'LG NanoCell TV', 'Mi Q1 55" QLED', 'TCL 4K Smart TV'],
    'Smartwatches': ['Apple Watch Series 10', 'Samsung Galaxy Watch 7', 'Noise ColorFit Ultra 3', 'Fitbit Versa 4', 'Amazfit GTS 5'],
    'Headphones': ['Sony WH-1000XM6', 'Bose QuietComfort Ultra', 'JBL Tune 770NC', 'Sennheiser Momentum 4', 'OnePlus Buds Pro 2'],
    'Chargers & Cables': ['Anker 65W GaN Charger', 'Apple MagSafe Charger', 'Samsung 45W Super Fast Charger', 'UGREEN USB-C to Lightning Cable', 'boAt 100W Type-C Cable'],
    'Gaming Consoles': ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch OLED', 'Logitech G Cloud', 'Steam Deck'],
    'Camera & Accessories': ['Canon EOS R7 Mirrorless', 'Sony Alpha ZV-E10', 'Nikon Z6 II', 'GoPro Hero 12', 'DJI OM 6 Gimbal'],
};

function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [message, setMessage] = useState('');
    const [editRow, setEditRow] = useState(null);
    const [editValues, setEditValues] = useState({ price: 0, netPrice: 0, stock: 0 });
    const [reduceQtyMap, setReduceQtyMap] = useState({});
    const [filterCategory, setFilterCategory] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/inventory');
            const data = await res.json();
            setInventory(data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleReduceStock = async (productName, category) => {
        const key = category + '|' + productName;
        const qty = reduceQtyMap[key];
        if (!qty || isNaN(qty) || Number(qty) <= 0) {
            alert('Enter valid quantity to reduce.');
            return;
        }
        if (!window.confirm(`Reduce stock of ${productName} by ${qty}?`)) return;
        const res = await fetch('/api/inventory/reduce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName, category, quantity: Number(qty) })
        });
        const data = await res.json();
        if (res.ok) {
            setMessage('Stock reduced!');
            fetchInventory();
            setReduceQtyMap(prev => ({ ...prev, [key]: '' }));
        } else {
            alert(data.message || 'Error reducing stock');
        }
    };

    const handleEdit = (row) => {
        setEditRow(row.category + '|' + row.productName);
        setEditValues({ price: row.price, netPrice: row.netPrice, stock: row.stock });
    };

    const handleEditChange = (e) => {
        setEditValues({ ...editValues, [e.target.name]: e.target.value });
    };

    const handleSave = async (row) => {
        if (!window.confirm(`Save changes to ${row.productName}?`)) return;
        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: row.productName,
                    category: row.category,
                    price: Number(editValues.price),
                    netPrice: Number(editValues.netPrice),
                    stock: Number(editValues.stock)
                })
            });
            if (res.ok) {
                await res.json();
                alert('Inventory updated!');
                setEditRow(null);
                fetchInventory();
            } else {
                let data;
                try { data = await res.json(); } catch { data = {}; }
                alert(data.message || 'Error updating inventory');
            }
        } catch (err) {
            alert('Network error while saving inventory.');
        }
    };

    // Merge master list and DB inventory
    const inventoryMap = {};
    inventory.forEach(item => {
        inventoryMap[item.category + '|' + item.productName] = item;
    });

    const allProducts = [];
    categoryOptions.forEach(category => {
        productOptions[category].forEach(productName => {
            allProducts.push({ category, productName });
        });
    });

    let displayRows = allProducts.map(({ category, productName }) => {
        const inv = inventoryMap[category + '|' + productName];
        return {
            category,
            productName,
            price: inv?.price ?? 0,
            netPrice: inv?.netPrice ?? 0,
            stock: inv?.stock ?? 0
        };
    }).sort((a, b) =>
        a.category.localeCompare(b.category) ||
        a.productName.localeCompare(b.productName)
    );

    // Filter by selected filterCategory
    if (filterCategory) {
        displayRows = displayRows.filter(row => row.category === filterCategory);
    }

    return (
        <div>
            <div className="inventory-main-layout">
                <aside className="inventory-sidebar">
                    <h3>Filter by Category</h3>
                    <ul className="inventory-category-list">
                        <li
                            className={!filterCategory ? 'active' : ''}
                            onClick={() => setFilterCategory('')}
                        >
                            All
                        </li>
                        {categoryOptions.map(cat => (
                            <li
                                key={cat}
                                className={filterCategory === cat ? 'active' : ''}
                                onClick={() => setFilterCategory(cat)}
                            >
                                {cat}
                            </li>
                        ))}
                    </ul>
                </aside>
                <div className="inventory-container">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                        minHeight: '3.5rem',
                        gap: '2rem',
                        flexWrap: 'wrap',
                        padding: '0 2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto' }}>
                            <h2 className="inventory-title" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'left' }}>
                                Inventory Management
                            </h2>
                            <button
                                className={`refresh-btn${refreshing ? ' spinning' : ''}`}
                                onClick={fetchInventory}
                                title="Refresh Inventory"
                                aria-label="Refresh Inventory"
                                style={{ marginLeft: '0.5rem' }}
                                disabled={refreshing}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </button>
                        </div>
                        <div className="inventory-nav-buttons" style={{ display: 'flex', gap: '0.75rem', flex: '0 0 auto', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button className="go-home-button" onClick={() => navigate('/form')}>Add Product</button>
                            <button className="go-home-button" onClick={() => navigate('/table-view')}>Table View</button>
                            <button className="go-home-button" onClick={() => navigate('/visualization')}>Visualization</button>
                            <button className="go-home-button" onClick={() => navigate('/')}>Login/Home</button>
                        </div>
                    </div>
                    {message && <div className="inventory-message">{message}</div>}
                    {/* Only the table updates on filter change */}
                    <InventoryTable
                        displayRows={displayRows}
                        editRow={editRow}
                        editValues={editValues}
                        handleEditChange={handleEditChange}
                        handleEdit={handleEdit}
                        handleSave={handleSave}
                        reduceQtyMap={reduceQtyMap}
                        setReduceQtyMap={setReduceQtyMap}
                        handleReduceStock={handleReduceStock}
                    />
                </div>
            </div>
        </div>
    );
}

// Table as a separate component
function InventoryTable({ displayRows, editRow, editValues, handleEditChange, handleEdit, handleSave, reduceQtyMap, setReduceQtyMap, handleReduceStock }) {
    // Function to determine stock level color
    const getStockLevelColor = (stock) => {
        const stockNum = Number(stock);
        if (stockNum <= 7) return 'low-stock';       // Red - Low stock
        if (stockNum <= 20) return 'medium-stock';   // Yellow - Medium stock
        return 'high-stock';                          // Green - Surplus stock
    };

    // Function to get stock level indicator
    const getStockLevelIndicator = (stock) => {
        const stockNum = Number(stock);
        if (stockNum <= 7) return '🔴';       // Red circle
        if (stockNum <= 20) return '🟡';      // Yellow circle
        return '🟢';                          // Green circle
    };

    return (
        <table className="inventory-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Net Price</th>
                    <th>Stock</th>
                    <th>Reduce</th>
                    <th>Edit</th>
                </tr>
            </thead>
            <tbody>
                {displayRows.map(item => {
                    const key = item.category + '|' + item.productName;
                    const isEditing = editRow === key;
                    const stockLevelClass = getStockLevelColor(item.stock);
                    const stockIndicator = getStockLevelIndicator(item.stock);
                    
                    return (
                        <tr key={key} className={stockLevelClass}>
                            <td>{item.category}</td>
                            <td>{item.productName}</td>
                            <td>
                                {isEditing ? (
                                    <input type="number" name="price" value={editValues.price} onChange={handleEditChange} className="inventory-input" />
                                ) : item.price}
                            </td>
                            <td>
                                {isEditing ? (
                                    <input type="number" name="netPrice" value={editValues.netPrice} onChange={handleEditChange} className="inventory-input" />
                                ) : item.netPrice}
                            </td>
                            <td className={`stock-cell ${stockLevelClass}`}>
                                {isEditing ? (
                                    <input type="number" name="stock" value={editValues.stock} onChange={handleEditChange} className="inventory-input" />
                                ) : (
                                    <span className="stock-display">
                                        {stockIndicator} {item.stock}
                                    </span>
                                )}
                            </td>
                            <td>
                                {!isEditing && (
                                    <>
                                        <input
                                            type="number"
                                            value={reduceQtyMap[key] || ''}
                                            onChange={(e) => setReduceQtyMap(prev => ({ ...prev, [key]: e.target.value }))}
                                            placeholder="Qty"
                                            className="inventory-input"
                                        />
                                        <button onClick={() => handleReduceStock(item.productName, item.category)} className="inventory-reduce-btn">Reduce</button>
                                    </>
                                )}
                            </td>
                            <td>
                                {isEditing ? (
                                    <button onClick={() => handleSave(item)} className="inventory-save-btn">Save</button>
                                ) : (
                                    <button onClick={() => handleEdit(item)} className="inventory-edit-btn">Edit</button>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default InventoryPage;
