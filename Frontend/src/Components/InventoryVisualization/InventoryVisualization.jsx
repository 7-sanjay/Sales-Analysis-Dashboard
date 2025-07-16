import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import '../Visualization/Visualization.css';
import { Sparklines, SparklinesLine } from 'react-sparklines';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const mockInventory = [
  { category: 'Smartphones', stock: 12, value: 120000 },
  { category: 'Laptops', stock: 7, value: 210000 },
  { category: 'Tablets', stock: 3, value: 45000 },
  { category: 'Headphones', stock: 25, value: 50000 },
  { category: 'Gaming Consoles', stock: 2, value: 80000 },
];

const stockByCategory = {
  labels: mockInventory.map(i => i.category),
  datasets: [
    {
      label: 'Stock Level',
      data: mockInventory.map(i => i.stock),
      backgroundColor: [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'
      ],
      borderRadius: 8,
    }
  ]
};

const valueByCategory = {
  labels: mockInventory.map(i => i.category),
  datasets: [
    {
      label: 'Inventory Value (₹)',
      data: mockInventory.map(i => i.value),
      backgroundColor: [
        '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#a8edea'
      ],
      borderRadius: 8,
    }
  ]
};

const lowStock = mockInventory.filter(i => i.stock <= 7);
const lowStockData = {
  labels: lowStock.map(i => i.category),
  datasets: [
    {
      label: 'Low Stock',
      data: lowStock.map(i => i.stock),
      backgroundColor: '#f5576c',
      borderRadius: 8,
    }
  ]
};

function InventoryVisualization() {
  const navigate = useNavigate();

  // Mock inventory data (replace with real data integration as needed)
  const inventory = [
    { category: 'Smartphones', stock: 12, price: 10000 },
    { category: 'Laptops', stock: 7, price: 30000 },
    { category: 'Tablets', stock: 3, price: 15000 },
    { category: 'Headphones', stock: 25, price: 2000 },
    { category: 'Gaming Consoles', stock: 2, price: 40000 },
  ];

  // KPI calculations
  const totalInventoryValue = inventory.reduce((sum, item) => sum + ((item.price || 0) * (item.stock || 0)), 0);
  const totalUnits = inventory.reduce((sum, item) => sum + (item.stock || 0), 0);
  const lowStockCount = inventory.filter(item => (item.stock || 0) <= 7).length;

  return (
    <div className="visualization-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title-gradient">Inventory Visualization</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="go-home-button" onClick={() => navigate('/table-view')}>
            Table View
          </button>
          <button className="go-home-button" onClick={() => navigate('/form')}>
            Add Product
          </button>
          <button className="go-home-button" onClick={() => navigate('/inventory')}>
            Inventory
          </button>
          <button className="go-home-button" onClick={() => navigate('/visualization')}>
            Visualization
          </button>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="kpi-cards" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card">
          <h3>💰 Total Inventory Value</h3>
          <p>₹{totalInventoryValue.toLocaleString('en-IN')}</p>
          <Sparklines data={inventory.map(i => (i.price || 0) * (i.stock || 0))} height={30} margin={5}>
            <SparklinesLine color="#667eea" style={{ fill: 'none', strokeWidth: 3 }} />
          </Sparklines>
        </div>
        <div className="kpi-card">
          <h3>📦 Total Units in Stock</h3>
          <p>{totalUnits.toLocaleString('en-IN')}</p>
          <Sparklines data={inventory.map(i => i.stock || 0)} height={30} margin={5}>
            <SparklinesLine color="#4facfe" style={{ fill: 'none', strokeWidth: 3 }} />
          </Sparklines>
        </div>
        <div className="kpi-card">
          <h3>🔴 Low Stock Products</h3>
          <p>{lowStockCount}</p>
          <Sparklines data={inventory.filter(i => (i.stock || 0) <= 7).map(i => i.stock || 0)} height={30} margin={5}>
            <SparklinesLine color="#f5576c" style={{ fill: 'none', strokeWidth: 3 }} />
          </Sparklines>
        </div>
      </div>
      <div className="chart-grid">
        <div className="chart">
          <h4>Stock Level by Category</h4>
          <Bar data={stockByCategory} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="chart">
          <h4>Inventory Value by Category</h4>
          <Pie data={valueByCategory} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
        </div>
        <div className="chart">
          <h4>Low Stock Products</h4>
          <Bar data={lowStockData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </div>
  );
}

export default InventoryVisualization; 