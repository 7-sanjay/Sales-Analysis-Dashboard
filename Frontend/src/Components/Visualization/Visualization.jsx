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

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map your product location names to the map's country names
const countryNameMapping = {
  "United States": "United States of America",
  "India": "India",
  "United Kingdom": "United Kingdom",
  "Canada": "Canada",
  "Australia": "Australia",
  "Germany": "Germany",
  "France": "France",
  "Japan": "Japan",
  "Brazil": "Brazil",
  "South Africa": "South Africa"
};

function VisualizationPage() {
  const [productData, setProductData] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [tooltipContent, setTooltipContent] = useState('');
  const navigate = useNavigate();

  const colorPalette = [...Array(50).keys()].map(i => `hsl(${i * 30 % 360}, 70%, 60%)`);

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

  return (
    <div className="visualization-container">
      <button className="go-home-button" onClick={() => navigate('/form')}>Go to Home</button>
      <h2>Sales Analysis Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <h3>Total Revenue</h3>
          <p>₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Profit</h3>
          <p>₹{totalProfit.toFixed(2)}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Units Sold</h3>
          <p>{totalUnits}</p>
        </div>
        <div className="kpi-card">
          <h3>Best Selling Product</h3>
          <p>{bestSellingProduct.productName || 'N/A'}</p>
        </div>
        <div className="kpi-card">
          <h3>Most Profitable Category</h3>
          <p>{topCategory || 'N/A'}</p>
        </div>
      </div>

      <div className="chart-grid">
        {/* 1. Revenue / Price-Related Visualizations */}
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

        {/* 2. Profit-Related Visualizations */}
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

        {/* 3. Quantity & Product Sales */}
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

        {/* 4. Time & Trend Analysis */}
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

        {/* 5. Geographical Visualizations */}
        <div className="chart map-chart">
          <h4>Products Sold by Country (Choropleth Map)</h4>
          <ReactTooltip>{tooltipContent}</ReactTooltip>
          <ComposableMap 
            data-tip="" 
            projectionConfig={{ scale: 150 }}
            style={{ width: "100%", height: "400px" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) => {
                // Count products sold per country, using mapping
                const countryCounts = {};
                const unmatchedLocations = new Set();
                productData.forEach(item => {
                  if (item.location) {
                    // Map location to map country name if possible
                    const mapped = countryNameMapping[item.location] || item.location;
                    countryCounts[mapped] = (countryCounts[mapped] || 0) + 1;
                  }
                });
                // For debugging: log unmatched locations
                geographies.forEach(geo => {
                  const countryName = geo.properties.NAME;
                  if (!Object.keys(countryCounts).includes(countryName)) {
                    unmatchedLocations.add(countryName);
                  }
                });
                if (unmatchedLocations.size > 0) {
                  console.log('Countries in map with no data:', Array.from(unmatchedLocations));
                }
                const counts = Object.values(countryCounts);
                const maxCount = Math.max(...counts, 1);
                // Simple blue color scale
                const colorScale = (value) => {
                  if (!value) return '#f0f4fa';
                  const intensity = Math.min(1, value / maxCount);
                  // Blue gradient: light to dark
                  return `rgba(34, 139, 230, ${0.3 + intensity * 0.7})`;
                };
                return geographies.map(geo => {
                  const countryName = geo.properties.NAME;
                  const count = countryCounts[countryName] || 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={colorScale(count)}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      onMouseEnter={() => {
                        setTooltipContent(
                          `${countryName} — Products Sold: ${count}`
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
                          strokeWidth: 1,
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

        {/* 6. Advanced Insights / KPIs */}
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
  );
}

export default VisualizationPage;
