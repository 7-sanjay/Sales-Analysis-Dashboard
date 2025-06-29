import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Pie, Radar, Scatter, Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, RadialLinearScale, TimeScale, Filler
} from 'chart.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import './Visualization.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  TimeScale,
  Filler
);

// Use a reliable GeoJSON source
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Comprehensive country name mapping
const countryNameMapping = {
  // Form names to GeoJSON names
  "United States": "United States of America",
  "India": "India",
  "United Kingdom": "United Kingdom",
  "Canada": "Canada",
  "Australia": "Australia",
  "Germany": "Germany",
  "France": "France",
  "Japan": "Japan",
  "Brazil": "Brazil",
  "South Africa": "South Africa",
  // Alternative mappings
  "USA": "United States of America",
  "UK": "United Kingdom",
  "US": "United States of America",
  // Add more variations as needed
};

function VisualizationPage() {
  const [productData, setProductData] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [tooltipContent, setTooltipContent] = useState('');
  const [geoData, setGeoData] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [activeSection, setActiveSection] = useState('kpis');
  const [navVisible, setNavVisible] = useState(true);
  const navigate = useNavigate();

  const colorPalette = [...Array(50).keys()].map(i => `hsl(${i * 30 % 360}, 70%, 60%)`);

  // Navigation sections
  const navigationSections = [
    {
      id: 'kpis',
      title: 'Advanced Insights / KPIs'
    },
    {
      id: 'revenue',
      title: 'Revenue / Price-Related Visualizations'
    },
    {
      id: 'profit',
      title: 'Profit-Related Visualizations'
    },
    {
      id: 'quantity',
      title: 'Quantity & Product Sales'
    },
    {
      id: 'time',
      title: 'Time & Trend Analysis'
    },
    {
      id: 'geographical',
      title: 'Geographical Visualizations'
    }
  ];

  // Fetch GeoJSON data
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        console.log('Fetching GeoJSON from:', geoUrl);
        const response = await fetch(geoUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('GeoJSON data loaded successfully:', data);
        setGeoData(data);
        setGeoError(null);
      } catch (error) {
        console.error('Error fetching GeoJSON:', error);
        setGeoError(error.message);
        // Fallback to a simple world map
        const fallbackData = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "United States of America" },
              geometry: { type: "Polygon", coordinates: [[[-125, 48], [-125, 25], [-66, 25], [-66, 48], [-125, 48]]] }
            },
            {
              type: "Feature", 
              properties: { name: "India" },
              geometry: { type: "Polygon", coordinates: [[[68, 37], [68, 8], [97, 8], [97, 37], [68, 37]]] }
            },
            {
              type: "Feature",
              properties: { name: "United Kingdom" },
              geometry: { type: "Polygon", coordinates: [[[-8, 60], [-8, 50], [2, 50], [2, 60], [-8, 60]]] }
            },
            {
              type: "Feature",
              properties: { name: "Canada" },
              geometry: { type: "Polygon", coordinates: [[[-141, 84], [-141, 42], [-52, 42], [-52, 84], [-141, 84]]] }
            },
            {
              type: "Feature",
              properties: { name: "Australia" },
              geometry: { type: "Polygon", coordinates: [[[113, -10], [113, -44], [154, -44], [154, -10], [113, -10]]] }
            },
            {
              type: "Feature",
              properties: { name: "Germany" },
              geometry: { type: "Polygon", coordinates: [[[6, 55], [6, 47], [15, 47], [15, 55], [6, 55]]] }
            },
            {
              type: "Feature",
              properties: { name: "France" },
              geometry: { type: "Polygon", coordinates: [[[-5, 51], [-5, 41], [10, 41], [10, 51], [-5, 51]]] }
            },
            {
              type: "Feature",
              properties: { name: "Japan" },
              geometry: { type: "Polygon", coordinates: [[[129, 46], [129, 30], [146, 30], [146, 46], [129, 46]]] }
            },
            {
              type: "Feature",
              properties: { name: "Brazil" },
              geometry: { type: "Polygon", coordinates: [[[-74, 5], [-74, -34], [-34, -34], [-34, 5], [-74, 5]]] }
            },
            {
              type: "Feature",
              properties: { name: "South Africa" },
              geometry: { type: "Polygon", coordinates: [[[16, -22], [16, -35], [33, -35], [33, -22], [16, -22]]] }
            }
          ]
        };
        setGeoData(fallbackData);
      }
    };
    fetchGeoData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        console.log('Raw API response:', response.data);
        setProductData(response.data);
        const profit = response.data.reduce((acc, item) => acc + (item.profit || 0), 0);
        const revenue = response.data.reduce((acc, item) => acc + (item.totalSales || 0), 0);
        const units = response.data.reduce((acc, item) => acc + (item.quantity || 0), 0);
        setTotalProfit(profit);
        setTotalRevenue(revenue);
        setTotalUnits(units);
        
        // Debug: Log the location data
        const locationData = dataBy('location', 'totalSales');
        console.log('Location data for visualization:', locationData);
        console.log('Available locations in form data:', locationData.keys);
        console.log('Sales by location:', locationData.values);
        console.log('Total products in database:', response.data.length);
        
        // Test: Show all products with their locations
        console.log('📊 All products with locations:');
        response.data.forEach((product, index) => {
          console.log(`  Product ${index + 1}: ${product.productName} - Location: ${product.location} - Sales: ₹${product.totalSales}`);
        });
        
        // Check if we have any data at all
        if (response.data.length === 0) {
          console.warn('No data found in database! Please add some data through the form first.');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const dataBy = (key, valueKey) => {
    const uniqueKeys = [...new Set(productData.map(item => item[key]).filter(Boolean))];
    const values = uniqueKeys.map(k =>
      productData.filter(item => item[key] === k).reduce((acc, item) => acc + (item[valueKey] || 0), 0)
    );
    return { keys: uniqueKeys, values };
  };

  const averageBy = (key, valueKey) => {
    const uniqueKeys = [...new Set(productData.map(item => item[key]).filter(Boolean))];
    const values = uniqueKeys.map(k => {
      const items = productData.filter(item => item[key] === k);
      return items.reduce((acc, item) => acc + (item[valueKey] || 0), 0) / items.length;
    });
    return { keys: uniqueKeys, values };
  };

  // Helper function to safely format chart data
  const safeChartData = (data, defaultValue = 0) => {
    return data.map(item => item !== undefined && item !== null ? item : defaultValue);
  };

  const profitByLocation = dataBy('location', 'profit');
  const locationProfitMap = profitByLocation.keys.reduce((acc, loc, i) => {
    acc[loc] = profitByLocation.values[i];
    return acc;
  }, {});

  const chartOptions = { 
    responsive: true, 
    plugins: { 
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y !== undefined && context.parsed.y !== null 
              ? context.parsed.y 
              : context.parsed.x !== undefined && context.parsed.x !== null 
                ? context.parsed.x 
                : 0;
            return `${context.dataset.label}: ₹${value.toFixed(2)}`;
          }
        }
      }
    } 
  };

  // KPI Calculations
  const bestSellingProduct = productData.reduce((best, current) => 
    (current.totalSales > best.totalSales) ? current : best, { totalSales: 0 });
  
  const mostProfitableCategory = dataBy('category', 'profit');
  const topCategory = mostProfitableCategory.keys[mostProfitableCategory.values.indexOf(Math.max(...mostProfitableCategory.values))];

  // Most Purchased Category (by quantity)
  const mostPurchasedCategoryData = dataBy('category', 'quantity');
  const mostPurchasedCategory = mostPurchasedCategoryData.keys[mostPurchasedCategoryData.values.indexOf(Math.max(...mostPurchasedCategoryData.values))];

  // Most Purchased Country (by quantity)
  const mostPurchasedCountryData = dataBy('location', 'quantity');
  const mostPurchasedCountry = mostPurchasedCountryData.keys[mostPurchasedCountryData.values.indexOf(Math.max(...mostPurchasedCountryData.values))];

  // Price range histogram data
  const priceRanges = [
    { min: 0, max: 5000, label: '₹0-5K' },
    { min: 5000, max: 10000, label: '₹5K-10K' },
    { min: 10000, max: 15000, label: '₹10K-15K' },
    { min: 15000, max: 20000, label: '₹15K-20K' },
    { min: 20000, max: 25000, label: '₹20K-25K' },
    { min: 25000, max: 30000, label: '₹25K-30K' },
    { min: 30000, max: 35000, label: '₹30K-35K' },
    { min: 35000, max: 40000, label: '₹35K-40K' },
    { min: 40000, max: 45000, label: '₹40K-45K' },
    { min: 45000, max: 50000, label: '₹45K-50K' }
  ];

  const priceHistogramData = priceRanges.map(range => ({
    label: range.label,
    count: productData.filter(item => item.price >= range.min && item.price < range.max).length
  }));

  // Top 5 products by sales
  const topProducts = [...productData]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  // Peak Sales Hour (by total sales)
  let peakSalesHour = 'N/A';
  if (productData.length > 0) {
    // Try to extract hour from the 'time' field (assuming it's a string or Date)
    const hourSales = {};
    productData.forEach(item => {
      if (item.time) {
        let hour = null;
        if (typeof item.time === 'string') {
          // Try to parse as ISO or HH:mm or similar
          const date = new Date(item.time);
          if (!isNaN(date)) {
            hour = date.getHours();
          } else {
            // Fallback: try to extract hour from string
            const match = item.time.match(/(\d{1,2}):/);
            if (match) hour = parseInt(match[1], 10);
          }
        } else if (item.time instanceof Date) {
          hour = item.time.getHours();
        }
        if (hour !== null && !isNaN(hour)) {
          hourSales[hour] = (hourSales[hour] || 0) + (item.totalSales || 0);
        }
      }
    });
    const peakHour = Object.keys(hourSales).reduce((a, b) => hourSales[a] > hourSales[b] ? a : b, null);
    if (peakHour !== null) peakSalesHour = `${peakHour}:00 - ${parseInt(peakHour, 10) + 1}:00`;
  }

  return (
    <div className="visualization-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title-gradient">Sales Analysis Dashboard</h2>
        <button className="go-home-button" onClick={() => navigate('/form')}>Go to Home</button>
      </div>
      
      <div className="dashboard-layout">
        {/* Navigation Toggle Button */}
        <button 
          className="nav-toggle-button"
          onClick={() => setNavVisible(!navVisible)}
          aria-label="Toggle navigation"
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Left Navigation Pane */}
        <div className={`navigation-pane ${navVisible ? 'visible' : 'hidden'}`}>
          <h3>Navigation</h3>
          {navigationSections.map((section) => (
            <div key={section.id} className="nav-section">
              <div 
                className={`nav-section-header ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.title}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className={`main-content ${navVisible ? 'with-nav' : 'full-width'}`}>
          {/* KPI Cards - Always visible */}
          <div className="kpi-cards">
            <div className="kpi-card">
              <h3>Total Revenue</h3>
              <p>₹{totalRevenue.toFixed(2)}</p>
              <Sparklines data={productData.map(p => p.totalSales || 0)} height={30} margin={5}>
                <SparklinesLine color="#fff" style={{ fill: "none", strokeWidth: 3 }} />
              </Sparklines>
            </div>
            <div className="kpi-card">
              <h3>Total Profit</h3>
              <p>₹{totalProfit.toFixed(2)}</p>
              <Sparklines data={productData.map(p => p.profit || 0)} height={30} margin={5}>
                <SparklinesLine color="#fff" style={{ fill: "none", strokeWidth: 3 }} />
              </Sparklines>
            </div>
            <div className="kpi-card">
              <h3>Total Units Sold</h3>
              <p>{totalUnits}</p>
              <Sparklines data={productData.map(p => p.quantity || 0)} height={30} margin={5}>
                <SparklinesLine color="#fff" style={{ fill: "none", strokeWidth: 3 }} />
              </Sparklines>
            </div>
            <div className="kpi-card">
              <h3>Best Selling Product</h3>
              <p>{bestSellingProduct.productName || 'N/A'}</p>
            </div>
            <div className="kpi-card">
              <h3>Most Profitable Category</h3>
              <p>{topCategory || 'N/A'}</p>
            </div>
            <div className="kpi-card">
              <h3>Most Purchased Category</h3>
              <p>{mostPurchasedCategory || 'N/A'}</p>
              <Sparklines data={productData.filter(p => p.category === mostPurchasedCategory).map(p => p.quantity || 0)} height={30} margin={5}>
                <SparklinesLine color="#fff" style={{ fill: "none", strokeWidth: 3 }} />
              </Sparklines>
            </div>
            <div className="kpi-card">
              <h3>Most Purchased Country</h3>
              <p>{mostPurchasedCountry || 'N/A'}</p>
              <Sparklines data={productData.filter(p => p.location === mostPurchasedCountry).map(p => p.quantity || 0)} height={30} margin={5}>
                <SparklinesLine color="#fff" style={{ fill: "none", strokeWidth: 3 }} />
              </Sparklines>
            </div>
            <div className="kpi-card">
              <h3>Peak Sales Hours</h3>
              <p>{peakSalesHour}</p>
              <Sparklines data={(() => {
                // Build array of sales by hour (0-23)
                const hourSalesArr = Array(24).fill(0);
                productData.forEach(item => {
                  if (item.time) {
                    let hour = null;
                    if (typeof item.time === 'string') {
                      const date = new Date(item.time);
                      if (!isNaN(date)) {
                        hour = date.getHours();
                      } else {
                        const match = item.time.match(/(\d{1,2}):/);
                        if (match) hour = parseInt(match[1], 10);
                      }
                    } else if (item.time instanceof Date) {
                      hour = item.time.getHours();
                    }
                    if (hour !== null && !isNaN(hour)) {
                      hourSalesArr[hour] += (item.totalSales || 0);
                    }
                  }
                });
                return hourSalesArr;
              })()} height={30} margin={5}>
                <SparklinesLine color="#fff" style={{ fill: "none", strokeWidth: 3 }} />
              </Sparklines>
            </div>
          </div>

          {/* Chart Sections */}
          <div className="chart-sections">
            {/* Advanced Insights / KPIs */}
            {activeSection === 'kpis' && (
              <div className="chart-section">
                <h3>Advanced Insights / KPIs</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>Profitability Ratio per Category</h4>
                    <Radar data={{
                      labels: dataBy('category', 'totalSales').keys,
                      datasets: [{
                        label: 'Profitability Ratio (%)',
                        data: safeChartData(dataBy('category', 'totalSales').keys.map(category => {
                          const categorySales = dataBy('category', 'totalSales').values[dataBy('category', 'totalSales').keys.indexOf(category)];
                          const categoryProfit = dataBy('category', 'profit').values[dataBy('category', 'profit').keys.indexOf(category)];
                          return categorySales ? ((categoryProfit / categorySales) * 100) : 0;
                        })),
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2
                      }]
                    }} options={chartOptions} />
                  </div>

                  {/* 1. Radar: Category-wise Average Profit Margin */}
                  <div className="chart">
                    <h4>Category-wise Average Profit Margin (%)</h4>
                    <Radar data={{
                      labels: averageBy('category', 'profit').keys,
                      datasets: [{
                        label: 'Avg Profit Margin (%)',
                        data: safeChartData(averageBy('category', 'profit').keys.map(category => {
                          const avgProfit = averageBy('category', 'profit').values[averageBy('category', 'profit').keys.indexOf(category)];
                          const avgPrice = averageBy('category', 'price').values[averageBy('category', 'price').keys.indexOf(category)];
                          return avgPrice ? ((avgProfit / avgPrice) * 100) : 0;
                        })),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2
                      }]
                    }} options={chartOptions} />
                  </div>

                  {/* 2. Radar: Category-wise Average Selling Price */}
                  <div className="chart">
                    <h4>Category-wise Average Selling Price</h4>
                    <Radar data={{
                      labels: averageBy('category', 'price').keys,
                      datasets: [{
                        label: 'Avg Selling Price',
                        data: safeChartData(averageBy('category', 'price').values),
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 2
                      }]
                    }} options={chartOptions} />
                  </div>

                  {/* 3. Bubble: Product Sales vs. Profit vs. Price */}
                  <div className="chart">
                    <h4>Product Sales vs. Profit vs. Price (Bubble)</h4>
                    <Bubble data={{
                      datasets: [
                        {
                          label: 'Products',
                          data: productData.map(p => ({
                            x: p.totalSales || 0,
                            y: p.profit || 0,
                            r: Math.max(5, Math.sqrt(p.price || 0) / 10) // Bubble size by price
                          })),
                          backgroundColor: 'rgba(153, 102, 255, 0.5)',
                          borderColor: 'rgba(153, 102, 255, 1)'
                        }
                      ]
                    }} options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const d = context.raw;
                              return `Sales: ₹${d.x}, Profit: ₹${d.y}, Price: ₹${Math.round(Math.pow(d.r, 2) * 100)}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          title: { display: true, text: 'Total Sales (₹)' }
                        },
                        y: {
                          title: { display: true, text: 'Profit (₹)' }
                        }
                      }
                    }} />
                  </div>
                </div>
              </div>
            )}

            {/* Revenue / Price-Related Visualizations */}
            {activeSection === 'revenue' && (
              <div className="chart-section">
                <h3>Revenue / Price-Related Visualizations</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>Total Revenue Over Time</h4>
                    <Line data={{
                      labels: productData.map(p => p.time || 'Unknown'),
                      datasets: [{
                        label: 'Revenue ₹',
                        data: safeChartData(productData.map(p => p.totalSales)),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.3,
                        fill: true
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>Average Selling Price per Product</h4>
                    <Bar data={{
                      labels: averageBy('productName', 'price').keys,
                      datasets: [{
                        label: 'Average Price ₹',
                        data: safeChartData(averageBy('productName', 'price').values),
                        backgroundColor: colorPalette
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>Top Categories by Total Revenue</h4>
                    <Doughnut data={{
                      labels: dataBy('category', 'totalSales').keys,
                      datasets: [{
                        label: 'Revenue ₹',
                        data: safeChartData(dataBy('category', 'totalSales').values),
                        backgroundColor: colorPalette
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>High vs Low Price Products</h4>
                    <Bar data={{
                      labels: priceHistogramData.map(d => d.label),
                      datasets: [{
                        label: 'Number of Products',
                        data: safeChartData(priceHistogramData.map(d => d.count)),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)'
                      }]
                    }} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* Profit-Related Visualizations */}
            {activeSection === 'profit' && (
              <div className="chart-section">
                <h3>Profit-Related Visualizations</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>Profit Margin per Product</h4>
                    <Bar data={{
                      labels: productData.map(p => p.productName || 'Unknown'),
                      datasets: [{
                        label: 'Profit Margin %',
                        data: safeChartData(productData.map(p => p.price ? ((p.profit / p.price) * 100) : 0)),
                        backgroundColor: 'rgba(255, 99, 132, 0.8)'
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>Total Profit Over Time</h4>
                    <Line data={{
                      labels: productData.map(p => p.time || 'Unknown'),
                      datasets: [{
                        label: 'Profit ₹',
                        data: safeChartData(productData.map(p => p.profit)),
                        borderColor: 'rgba(255, 159, 64, 1)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        tension: 0.3,
                        fill: true
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>Most Profitable Categories</h4>
                    <Bar data={{
                      labels: dataBy('category', 'profit').keys,
                      datasets: [{
                        label: 'Profit ₹',
                        data: safeChartData(dataBy('category', 'profit').values),
                        backgroundColor: 'rgba(153, 102, 255, 0.8)'
                      }]
                    }} options={{ ...chartOptions, indexAxis: 'y' }} />
                  </div>

                  <div className="chart">
                    <h4>Profit vs Sales Correlation</h4>
                    <Scatter data={{
                      datasets: [{
                        label: 'Products',
                        data: productData
                          .filter(p => p.totalSales !== undefined && p.totalSales !== null && p.profit !== undefined && p.profit !== null)
                          .map(p => ({
                            x: p.totalSales,
                            y: p.profit
                          })),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)'
                      }]
                    }} options={{
                      ...chartOptions,
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Total Sales (₹)'
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Profit (₹)'
                          }
                        }
                      }
                    }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Product Sales */}
            {activeSection === 'quantity' && (
              <div className="chart-section">
                <h3>Quantity & Product Sales</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>Quantity Sold per Product</h4>
                    <Bar data={{
                      labels: dataBy('productName', 'quantity').keys,
                      datasets: [{
                        label: 'Quantity',
                        data: safeChartData(dataBy('productName', 'quantity').values),
                        backgroundColor: 'rgba(75, 192, 192, 0.8)'
                      }]
                    }} options={{ ...chartOptions, indexAxis: 'y' }} />
                  </div>

                  <div className="chart">
                    <h4>Top 5 Best-Selling Products</h4>
                    <Bar data={{
                      labels: topProducts.map(p => p.productName || 'Unknown'),
                      datasets: [{
                        label: 'Sales ₹',
                        data: safeChartData(topProducts.map(p => p.totalSales)),
                        backgroundColor: 'rgba(255, 205, 86, 0.8)'
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>Category-wise Product Sales</h4>
                    <Bar data={{
                      labels: dataBy('category', 'quantity').keys,
                      datasets: [{
                        label: 'Quantity Sold',
                        data: safeChartData(dataBy('category', 'quantity').values),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)'
                      }]
                    }} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* Time & Trend Analysis */}
            {activeSection === 'time' && (
              <div className="chart-section">
                <h3>Time & Trend Analysis</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>Daily Sales Trend</h4>
                    <Line data={{
                      labels: productData.map(p => p.time || 'Unknown'),
                      datasets: [{
                        label: 'Sales ₹',
                        data: safeChartData(productData.map(p => p.totalSales)),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.4,
                        fill: true
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>Time vs Category Sales</h4>
                    <Line data={{
                      labels: productData.map(p => p.time || 'Unknown'),
                      datasets: dataBy('category', 'totalSales').keys.map((category, index) => ({
                        label: category,
                        data: safeChartData(productData.filter(p => p.category === category).map(p => p.totalSales)),
                        borderColor: colorPalette[index],
                        backgroundColor: colorPalette[index] + '20',
                        tension: 0.3
                      }))
                    }} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* Geographical Visualizations */}
            {activeSection === 'geographical' && (
              <div className="chart-section">
                <h3>Geographical Visualizations</h3>
                <div className="chart-grid">
                  {/* Choropleth Map */}
                  <div className="chart map-chart">
                    <h4>Purchase Quantity by Country (Choropleth Map)</h4>
                    <ReactTooltip>{tooltipContent}</ReactTooltip>
                    {/* Debug info */}
                    <div style={{ marginBottom: "10px", fontSize: "12px", color: "#666" }}>
                      <p>GeoData loaded: {geoData ? 'Yes' : 'No'}</p>
                      <p>Product data count: {productData.length}</p>
                      <p>Locations in data: {[...new Set(productData.map(p => p.location))].join(', ')}</p>
                    </div>
                    {geoData && (
                      <ComposableMap 
                        data-tip="" 
                        projectionConfig={{ scale: 150 }}
                        style={{ width: "100%", height: "400px" }}
                      >
                        <Geographies geography={geoData}>
                          {({ geographies }) => {
                            console.log('Rendering map with geographies:', geographies.length);
                            // Count purchase quantity and product count per country, using mapping
                            const countryQuantities = {};
                            const countryProductCounts = {};
                            const unmatchedCountries = new Set();
                            productData.forEach(item => {
                              if (item.location) {
                                const mapped = countryNameMapping[item.location] || item.location;
                                countryQuantities[mapped] = (countryQuantities[mapped] || 0) + (item.quantity || 0);
                                if (!countryProductCounts[mapped]) countryProductCounts[mapped] = new Set();
                                countryProductCounts[mapped].add(item.productName);
                              }
                            });
                            // Debug: Log the mapping process
                            console.log('Country quantities:', countryQuantities);
                            console.log('Country product counts:', Object.fromEntries(Object.entries(countryProductCounts).map(([k, v]) => [k, v.size])));
                            console.log('Available countries in GeoJSON:', geographies.map(geo => geo.properties.name || geo.properties.NAME));
                            // For debugging: log unmatched countries
                            geographies.forEach(geo => {
                              const countryName = geo.properties.name || geo.properties.NAME;
                              if (!Object.keys(countryQuantities).includes(countryName)) {
                                unmatchedCountries.add(countryName);
                              }
                            });
                            if (unmatchedCountries.size > 0) {
                              console.log('Countries in map with no data:', Array.from(unmatchedCountries));
                            }
                            const quantities = Object.values(countryQuantities);
                            const maxQuantity = Math.max(...quantities, 1);
                            
                            // Improved color scale based on quantity with better differentiation
                            const colorScale = (value) => {
                              if (!value || value === 0) return '#f0f4fa'; // Light grey for no data
                              
                              // Create a more distinct color gradient
                              const intensity = Math.min(1, value / maxQuantity);
                              
                              // Use a red gradient with better differentiation
                              if (intensity < 0.2) return '#ffebee'; // Very light red
                              if (intensity < 0.4) return '#ffcdd2'; // Light red
                              if (intensity < 0.6) return '#ef9a9a'; // Medium red
                              if (intensity < 0.8) return '#e57373'; // Darker red
                              return '#f44336'; // Dark red for highest values
                            };

                            // Debug: Log the color mapping
                            console.log('Color scale debug:');
                            Object.entries(countryQuantities).forEach(([country, quantity]) => {
                              const color = colorScale(quantity);
                              console.log(`${country}: ${quantity} units -> ${color}`);
                            });

                            return geographies.map(geo => {
                              const countryName = geo.properties.name || geo.properties.NAME;
                              const quantity = countryQuantities[countryName] || 0;
                              const productCount = countryProductCounts[countryName] ? countryProductCounts[countryName].size : 0;
                              
                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  fill={colorScale(quantity)}
                                  stroke={quantity > 0 ? "#d32f2f" : "#ffffff"}
                                  strokeWidth={quantity > 0 ? 2 : 0.5}
                                  onMouseEnter={() => {
                                    setTooltipContent(
                                      `${countryName} — Purchase Quantity: ${quantity}<br/>Products Sold: ${productCount}`
                                    );
                                  }}
                                  onMouseLeave={() => {
                                    setTooltipContent('');
                                  }}
                                  style={{
                                    default: { 
                                      outline: 'none',
                                      transition: 'all 0.3s ease'
                                    },
                                    hover: { 
                                      fill: "#ff6b6b", 
                                      outline: "none",
                                      stroke: "#ffffff",
                                      strokeWidth: 3,
                                      cursor: "pointer"
                                    },
                                    pressed: { 
                                      outline: "none",
                                      fill: "#ff5252"
                                    }
                                  }}
                                />
                              );
                            });
                          }}
                        </Geographies>
                      </ComposableMap>
                    )}
                    {/* Color Legend - moved inside map-chart */}
                    {geoData && (
                      <div className="map-legend">
                        <h5 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#495057" }}>Purchase Quantity Legend</h5>
                        <div className="legend-items">
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#f0f4fa" }}></div>
                            <span>No Data</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#ffebee" }}></div>
                            <span>Low (0-20%)</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#ffcdd2" }}></div>
                            <span>Medium (20-40%)</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#ef9a9a" }}></div>
                            <span>High (40-60%)</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#e57373" }}></div>
                            <span>Very High (60-80%)</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#f44336" }}></div>
                            <span>Highest (80-100%)</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {!geoData && (
                      <div style={{ 
                        height: "400px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px"
                      }}>
                        <p>Loading map data...</p>
                      </div>
                    )}
                    {geoError && (
                      <div style={{ 
                        padding: "10px",
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffeaa7",
                        borderRadius: "4px",
                        marginTop: "10px"
                      }}>
                        <p style={{ margin: 0, color: "#856404" }}>
                          Map loading error: {geoError}. Using fallback data.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="chart">
                    <h4>Sales by Location (Geographical Distribution)</h4>
                    <Bar data={{
                      labels: dataBy('location', 'totalSales').keys,
                      datasets: [{
                        label: 'Total Sales ₹',
                        data: safeChartData(dataBy('location', 'totalSales').values),
                        backgroundColor: 'rgba(34, 139, 230, 0.8)',
                        borderColor: 'rgba(34, 139, 230, 1)',
                        borderWidth: 1
                      }]
                    }} options={{ 
                      ...chartOptions, 
                      indexAxis: 'y',
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed.x || 0;
                              return `Sales: ₹${value.toLocaleString('en-IN')}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Total Sales (₹)'
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Location'
                          }
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>Profit by Location</h4>
                    <Bar data={{
                      labels: dataBy('location', 'profit').keys,
                      datasets: [{
                        label: 'Total Profit ₹',
                        data: safeChartData(dataBy('location', 'profit').values),
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                      }]
                    }} options={{ 
                      ...chartOptions, 
                      indexAxis: 'y',
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed.x || 0;
                              return `Profit: ₹${value.toLocaleString('en-IN')}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Total Profit (₹)'
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Location'
                          }
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>Location Performance Comparison</h4>
                    <Bar data={{
                      labels: dataBy('location', 'totalSales').keys,
                      datasets: [
                        {
                          label: 'Sales ₹',
                          data: safeChartData(dataBy('location', 'totalSales').values),
                          backgroundColor: 'rgba(75, 192, 192, 0.8)',
                          borderColor: 'rgba(75, 192, 192, 1)',
                          borderWidth: 1
                        },
                        {
                          label: 'Profit ₹',
                          data: safeChartData(dataBy('location', 'profit').values),
                          backgroundColor: 'rgba(255, 159, 64, 0.8)',
                          borderColor: 'rgba(255, 159, 64, 1)',
                          borderWidth: 1
                        }
                      ]
                    }} options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed.y || 0;
                              return `${context.dataset.label}: ₹${value.toLocaleString('en-IN')}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          title: {
                            display: true,
                            text: 'Amount (₹)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Location'
                          }
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>Sales by Location</h4>
                    <Pie data={{
                      labels: dataBy('location', 'totalSales').keys,
                      datasets: [{
                        label: 'Sales ₹',
                        data: safeChartData(dataBy('location', 'totalSales').values),
                        backgroundColor: colorPalette
                      }]
                    }} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisualizationPage;
