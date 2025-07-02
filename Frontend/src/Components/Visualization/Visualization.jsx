import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Pie, Radar, Scatter, Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, RadialLinearScale, TimeScale, Filler
} from 'chart.js';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Modern color palette with better contrast
  const modernColorPalette = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
    '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#a8edea', '#fed6e3',
    '#d299c2', '#fef9d7', '#667eea', '#764ba2', '#f093fb', '#f5576c'
  ];

  // Navigation sections with icons
  const navigationSections = [
    {
      id: 'kpis',
      title: '📊 Advanced Insights & KPIs',
      icon: '📊'
    },
    {
      id: 'revenue',
      title: '💰 Revenue & Price Analysis',
      icon: '💰'
    },
    {
      id: 'profit',
      title: '📈 Profit Analytics',
      icon: '📈'
    },
    {
      id: 'quantity',
      title: '📦 Quantity & Product Sales',
      icon: '📦'
    },
    {
      id: 'time',
      title: '⏰ Time & Trend Analysis',
      icon: '⏰'
    },
    {
      id: 'geographical',
      title: '🌍 Geographical Insights',
      icon: '🌍'
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
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`);
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state && location.state.section) {
      setActiveSection(location.state.section);
    }
  }, [location.state]);

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

  // Enhanced chart options with modern styling
  const chartOptions = { 
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y !== undefined && context.parsed.y !== null 
              ? context.parsed.y 
              : context.parsed.x !== undefined && context.parsed.x !== null 
                ? context.parsed.x 
                : 0;
            return `${context.dataset.label}: ₹${value.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          borderColor: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          borderColor: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, sans-serif'
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

  // --- KPI Calculations ---
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

  // Helper to filter by time (assumes p.time is ISO string or Date)
  function isInRange(item, from, to) {
    if (!item.time) return false;
    const t = typeof item.time === 'string' ? new Date(item.time) : item.time;
    return t >= from && t < to;
  }

  // Calculate sums for last 3 hours and previous 3 hours
  function sumByTimeWindow(key) {
    const last3 = productData.filter(p => isInRange(p, threeHoursAgo, now)).reduce((acc, p) => acc + (p[key] || 0), 0);
    const prev3 = productData.filter(p => isInRange(p, sixHoursAgo, threeHoursAgo)).reduce((acc, p) => acc + (p[key] || 0), 0);
    return { last3, prev3 };
  }

  function percentChange(last, prev) {
    if (prev === 0) return last === 0 ? 0 : 100;
    return ((last - prev) / Math.abs(prev)) * 100;
  }

  const revenueWindow = sumByTimeWindow('totalSales');
  const profitWindow = sumByTimeWindow('profit');
  const unitsWindow = sumByTimeWindow('quantity');

  const revenueChange = percentChange(revenueWindow.last3, revenueWindow.prev3);
  const profitChange = percentChange(profitWindow.last3, profitWindow.prev3);
  const unitsChange = percentChange(unitsWindow.last3, unitsWindow.prev3);

  function renderChange(val, small) {
    if (val === 0) return <span style={{ color: '#888', fontSize: small ? '0.95rem' : undefined, fontWeight: 500 }}>&#8596; 0%</span>;
    const up = val > 0;
    return (
      <span style={{ color: up ? '#43e97b' : '#f5576c', fontWeight: 600, fontSize: small ? '0.95rem' : undefined }}>
        {up ? '▲' : '▼'} {Math.abs(val).toFixed(1)}%
      </span>
    );
  }

  // Loading component
  const LoadingSkeleton = () => (
    <div className="chart loading-skeleton" style={{ height: '400px' }}>
      <div style={{ height: '100%', borderRadius: '8px' }}></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="visualization-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title-gradient">Sales Analysis Dashboard</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="go-home-button" onClick={() => navigate('/Table-view')}>
              Table View
            </button>
            <button className="go-home-button" onClick={() => navigate('/form')}>
              Go to Home
            </button>
          </div>
        </div>
        
        <div className="kpi-cards">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="kpi-card loading-skeleton">
              <div style={{ height: '80px' }}></div>
            </div>
          ))}
        </div>
        
        <div className="chart-grid">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="visualization-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className={`nav-toggle-button${navVisible ? ' open' : ''}`}
            onClick={() => setNavVisible(!navVisible)}
            aria-label="Toggle navigation"
            title="Toggle Navigation Menu"
            style={{ position: 'static', background: 'var(--primary-gradient)' }}
          >
            <div className={`hamburger-icon${navVisible ? ' open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          <h2 className="dashboard-title-gradient">Sales Analysis Dashboard</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="go-home-button" onClick={() => navigate('/Table-view')}>
            Table View
          </button>
          <button className="go-home-button" onClick={() => navigate('/form')}>
            Go to Home
          </button>
        </div>
      </div>
      
      <div className="dashboard-layout">
        {/* Left Navigation Pane */}
        <div className={`navigation-pane ${navVisible ? 'visible' : 'hidden'}`}>
          <h3>📋 Navigation Menu</h3>
          <div className="nav-section">
            <div 
              className={`nav-section-header ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => setActiveSection('home')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && setActiveSection('home')}
              style={{ transition: 'all 0.3s' }}
            >
              <span role="img" aria-label="home" style={{ marginRight: '0.5rem', transition: 'transform 0.3s', display: 'inline-block', transform: activeSection === 'home' ? 'scale(1.2)' : 'scale(1)' }}>🏠</span>
              Home
            </div>
          </div>
          {navigationSections.map((section) => (
            <div key={section.id} className="nav-section">
              <div 
                className={`nav-section-header ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && setActiveSection(section.id)}
              >
                {section.title}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className={`main-content ${navVisible ? 'with-nav' : 'full-width'}`}>
          {/* KPI Cards - Only show in Home section */}
          {activeSection === 'home' && (
            <div className="kpi-cards">
              <div className="kpi-card">
                <h3>💰 Total Revenue</h3>
                <p>₹{totalRevenue.toLocaleString('en-IN')}</p>
                <Sparklines data={productData.map(p => p.totalSales || 0)} height={30} margin={5}>
                  <SparklinesLine color="#667eea" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
                <div className="kpi-change-row">
                  <span className="kpi-change-value">{renderChange(revenueChange, true)}</span>
                  <span className="kpi-change-label">Since last 3 hours</span>
                </div>
              </div>
              <div className="kpi-card">
                <h3>📈 Total Profit</h3>
                <p>₹{totalProfit.toLocaleString('en-IN')}</p>
                <Sparklines data={productData.map(p => p.profit || 0)} height={30} margin={5}>
                  <SparklinesLine color="#f093fb" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
                <div className="kpi-change-row">
                  <span className="kpi-change-value">{renderChange(profitChange, true)}</span>
                  <span className="kpi-change-label">Since last 3 hours</span>
                </div>
              </div>
              <div className="kpi-card">
                <h3>📦 Total Units Sold</h3>
                <p>{totalUnits.toLocaleString('en-IN')}</p>
                <Sparklines data={productData.map(p => p.quantity || 0)} height={30} margin={5}>
                  <SparklinesLine color="#4facfe" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
                <div className="kpi-change-row">
                  <span className="kpi-change-value">{renderChange(unitsChange, true)}</span>
                  <span className="kpi-change-label">Since last 3 hours</span>
                </div>
              </div>
              <div className="kpi-card">
                <h3>🏆 Best Selling Product</h3>
                <p>{bestSellingProduct.productName || 'N/A'}</p>
              </div>
              <div className="kpi-card">
                <h3>💎 Most Profitable Category</h3>
                <p>{topCategory || 'N/A'}</p>
              </div>
              <div className="kpi-card">
                <h3>🛒 Most Purchased Category</h3>
                <p>{mostPurchasedCategory || 'N/A'}</p>
                <Sparklines data={productData.filter(p => p.category === mostPurchasedCategory).map(p => p.quantity || 0)} height={30} margin={5}>
                  <SparklinesLine color="#43e97b" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
              </div>
              <div className="kpi-card">
                <h3>🌍 Top Purchasing Country</h3>
                <p>{mostPurchasedCountry || 'N/A'}</p>
                <Sparklines data={productData.filter(p => p.location === mostPurchasedCountry).map(p => p.quantity || 0)} height={30} margin={5}>
                  <SparklinesLine color="#fa709a" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
              </div>
              <div className="kpi-card">
                <h3>⏰ Peak Sales Hours</h3>
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
                  <SparklinesLine color="#a8edea" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
              </div>
            </div>
          )}

          {/* Chart Sections */}
          <div className="chart-sections">
            {/* Advanced Insights / KPIs */}
            {activeSection === 'kpis' && (
              <div className="chart-section">
                <h3>📊 Advanced Insights & KPIs</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>🎯 Profitability Ratio per Category</h4>
                    <Radar data={{
                      labels: dataBy('category', 'totalSales').keys,
                      datasets: [{
                        label: 'Profitability Ratio (%)',
                        data: safeChartData(dataBy('category', 'totalSales').keys.map(category => {
                          const categorySales = dataBy('category', 'totalSales').values[dataBy('category', 'totalSales').keys.indexOf(category)];
                          const categoryProfit = dataBy('category', 'profit').values[dataBy('category', 'profit').keys.indexOf(category)];
                          return categorySales ? ((categoryProfit / categorySales) * 100) : 0;
                        })),
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
                      }]
                    }} options={{
                      ...chartOptions,
                      scales: {
                        r: {
                          angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          },
                          pointLabels: {
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }} />
                  </div>

                  {/* 1. Radar: Category-wise Average Profit Margin */}
                  <div className="chart">
                    <h4>📊 Category-wise Average Profit Margin (%)</h4>
                    <Radar data={{
                      labels: averageBy('category', 'profit').keys,
                      datasets: [{
                        label: 'Avg Profit Margin (%)',
                        data: safeChartData(averageBy('category', 'profit').keys.map(category => {
                          const avgProfit = averageBy('category', 'profit').values[averageBy('category', 'profit').keys.indexOf(category)];
                          const avgPrice = averageBy('category', 'price').values[averageBy('category', 'price').keys.indexOf(category)];
                          return avgPrice ? ((avgProfit / avgPrice) * 100) : 0;
                        })),
                        backgroundColor: 'rgba(240, 147, 251, 0.2)',
                        borderColor: 'rgba(240, 147, 251, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(240, 147, 251, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(240, 147, 251, 1)'
                      }]
                    }} options={{
                      ...chartOptions,
                      scales: {
                        r: {
                          angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          },
                          pointLabels: {
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }} />
                  </div>

                  {/* 2. Radar: Category-wise Average Selling Price */}
                  <div className="chart">
                    <h4>💰 Category-wise Average Selling Price</h4>
                    <Radar data={{
                      labels: averageBy('category', 'price').keys,
                      datasets: [{
                        label: 'Avg Selling Price',
                        data: safeChartData(averageBy('category', 'price').values),
                        backgroundColor: 'rgba(79, 172, 254, 0.2)',
                        borderColor: 'rgba(79, 172, 254, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(79, 172, 254, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(79, 172, 254, 1)'
                      }]
                    }} options={{
                      ...chartOptions,
                      scales: {
                        r: {
                          angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          },
                          pointLabels: {
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }} />
                  </div>

                  {/* 3. Bubble: Product Sales vs. Profit vs. Price */}
                  <div className="chart">
                    <h4>🎈 Product Sales vs. Profit vs. Price (Bubble)</h4>
                    <Bubble data={{
                      datasets: [
                        {
                          label: 'Products',
                          data: productData.map(p => ({
                            x: p.totalSales || 0,
                            y: p.profit || 0,
                            r: Math.max(5, Math.sqrt(p.price || 0) / 10) // Bubble size by price
                          })),
                          backgroundColor: 'rgba(67, 233, 123, 0.6)',
                          borderColor: 'rgba(67, 233, 123, 1)',
                          borderWidth: 2
                        }
                      ]
                    }} options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            label: function(context) {
                              const d = context.raw;
                              return `Sales: ₹${d.x.toLocaleString('en-IN')}, Profit: ₹${d.y.toLocaleString('en-IN')}, Price: ₹${Math.round(Math.pow(d.r, 2) * 100).toLocaleString('en-IN')}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          ...chartOptions.scales.x,
                          title: { display: true, text: 'Total Sales (₹)' }
                        },
                        y: {
                          ...chartOptions.scales.y,
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
                <h3>💰 Revenue & Price Analysis</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>📈 Total Revenue Over Time</h4>
                    <Line data={{
                      labels: productData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
                      datasets: [{
                        label: 'Revenue ₹',
                        data: safeChartData(productData.map(p => p.totalSales)),
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3,
                        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 8
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>💵 Average Selling Price per Product</h4>
                    <Bar data={{
                      labels: averageBy('productName', 'price').keys,
                      datasets: [{
                        label: 'Average Price ₹',
                        data: safeChartData(averageBy('productName', 'price').values),
                        backgroundColor: modernColorPalette,
                        borderColor: modernColorPalette.map(color => color.replace('0.8', '1')),
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>🏆 Top Categories by Total Revenue</h4>
                    <Doughnut data={{
                      labels: dataBy('category', 'totalSales').keys,
                      datasets: [{
                        label: 'Revenue ₹',
                        data: safeChartData(dataBy('category', 'totalSales').values),
                        backgroundColor: modernColorPalette,
                        borderColor: '#fff',
                        borderWidth: 3,
                        hoverBorderWidth: 5
                      }]
                    }} options={{
                      ...chartOptions,
                      cutout: '60%',
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: 'right'
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>💎 Price Distribution Analysis</h4>
                    <Bar data={{
                      labels: priceHistogramData.map(d => d.label),
                      datasets: [{
                        label: 'Number of Products',
                        data: safeChartData(priceHistogramData.map(d => d.count)),
                        backgroundColor: 'rgba(79, 172, 254, 0.8)',
                        borderColor: 'rgba(79, 172, 254, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* Profit-Related Visualizations */}
            {activeSection === 'profit' && (
              <div className="chart-section">
                <h3>📈 Profit Analytics</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>📊 Profit Margin per Product</h4>
                    <Bar data={{
                      labels: productData.map(p => p.productName || 'Unknown'),
                      datasets: [{
                        label: 'Profit Margin %',
                        data: safeChartData(productData.map(p => p.price ? ((p.profit / p.price) * 100) : 0)),
                        backgroundColor: 'rgba(250, 112, 154, 0.8)',
                        borderColor: 'rgba(250, 112, 154, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        },
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            ...chartOptions.plugins.tooltip.callbacks,
                            label: function(context) {
                              const value = context.parsed.x || context.parsed.y || 0;
                              return `Profit Margin: ${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`;
                            }
                          }
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>📈 Total Profit Over Time</h4>
                    <Line data={{
                      labels: productData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
                      datasets: [{
                        label: 'Profit ₹',
                        data: safeChartData(productData.map(p => p.profit)),
                        borderColor: 'rgba(250, 112, 154, 1)',
                        backgroundColor: 'rgba(250, 112, 154, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3,
                        pointBackgroundColor: 'rgba(250, 112, 154, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 8
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>🏆 Most Profitable Categories</h4>
                    <Bar data={{
                      labels: dataBy('category', 'profit').keys,
                      datasets: [{
                        label: 'Profit ₹',
                        data: safeChartData(dataBy('category', 'profit').values),
                        backgroundColor: 'rgba(67, 233, 123, 0.8)',
                        borderColor: 'rgba(67, 233, 123, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={{ 
                      ...chartOptions, 
                      indexAxis: 'y',
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        },
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            ...chartOptions.plugins.tooltip.callbacks,
                            label: function(context) {
                              const value = context.parsed.x || context.parsed.y || 0;
                              return `Profit: ₹${value.toLocaleString('en-IN')}`;
                            }
                          }
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>🎯 Profit vs Sales Correlation</h4>
                    <Scatter data={{
                      datasets: [{
                        label: 'Products',
                        data: productData
                          .filter(p => p.totalSales !== undefined && p.totalSales !== null && p.profit !== undefined && p.profit !== null)
                          .map(p => ({
                            x: p.totalSales,
                            y: p.profit
                          })),
                        backgroundColor: 'rgba(168, 237, 234, 0.8)',
                        borderColor: 'rgba(168, 237, 234, 1)',
                        borderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 10
                      }]
                    }} options={{
                      ...chartOptions,
                      scales: {
                        x: {
                          ...chartOptions.scales.x,
                          title: {
                            display: true,
                            text: 'Total Sales (₹)'
                          }
                        },
                        y: {
                          ...chartOptions.scales.y,
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
                <h3>📦 Quantity & Product Sales</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>📊 Quantity Sold per Product</h4>
                    <Bar data={{
                      labels: dataBy('productName', 'quantity').keys,
                      datasets: [{
                        label: 'Quantity',
                        data: safeChartData(dataBy('productName', 'quantity').values),
                        backgroundColor: 'rgba(79, 172, 254, 0.8)',
                        borderColor: 'rgba(79, 172, 254, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={{ 
                      ...chartOptions, 
                      indexAxis: 'y',
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        },
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            ...chartOptions.plugins.tooltip.callbacks,
                            label: function(context) {
                              const value = context.parsed.x || context.parsed.y || 0;
                              return `Quantity: ${value.toLocaleString('en-IN')}`;
                            }
                          }
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>🏆 Top 5 Best-Selling Products</h4>
                    <Bar data={{
                      labels: topProducts.map(p => p.productName || 'Unknown'),
                      datasets: [{
                        label: 'Sales ₹',
                        data: safeChartData(topProducts.map(p => p.totalSales)),
                        backgroundColor: modernColorPalette.slice(0, 5),
                        borderColor: modernColorPalette.slice(0, 5).map(color => color.replace('0.8', '1')),
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>📈 Category-wise Product Sales</h4>
                    <Bar data={{
                      labels: dataBy('category', 'quantity').keys,
                      datasets: [{
                        label: 'Quantity Sold',
                        data: safeChartData(dataBy('category', 'quantity').values),
                        backgroundColor: 'rgba(67, 233, 123, 0.8)',
                        borderColor: 'rgba(67, 233, 123, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={
                      {
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            display: false
                          },
                          tooltip: {
                            ...chartOptions.plugins.tooltip,
                            callbacks: {
                              ...chartOptions.plugins.tooltip.callbacks,
                              label: function(context) {
                                const value = context.parsed.x || context.parsed.y || 0;
                                return `Quantity Sold: ${value.toLocaleString('en-IN')}`;
                              }
                            }
                          }
                        }
                      }
                    } />
                  </div>
                </div>
              </div>
            )}

            {/* Time & Trend Analysis */}
            {activeSection === 'time' && (
              <div className="chart-section">
                <h3>⏰ Time & Trend Analysis</h3>
                <div className="chart-grid">
                  <div className="chart">
                    <h4>📈 Daily Sales Trend</h4>
                    <Line data={{
                      labels: productData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
                      datasets: [{
                        label: 'Sales ₹',
                        data: safeChartData(productData.map(p => p.totalSales)),
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3,
                        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 8
                      }]
                    }} options={chartOptions} />
                  </div>

                  <div className="chart">
                    <h4>🎯 Time vs Category Sales</h4>
                    <Line data={{
                      labels: productData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
                      datasets: dataBy('category', 'totalSales').keys.map((category, index) => ({
                        label: category,
                        data: safeChartData(productData.filter(p => p.category === category).map(p => p.totalSales)),
                        borderColor: modernColorPalette[index],
                        backgroundColor: modernColorPalette[index] + '20',
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                      }))
                    }} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* Geographical Visualizations */}
            {activeSection === 'geographical' && (
              <div className="chart-section">
                <h3>🌍 Geographical Insights</h3>
                <div className="chart-grid">
                  {/* Choropleth Map */}
                  <div className="chart map-chart">
                    <h4>🗺️ Purchase Quantity by Country (Interactive Map)</h4>
                    <ReactTooltip>{tooltipContent}</ReactTooltip>
                    {/* Debug info */}
                    <div style={{ marginBottom: "10px", fontSize: "12px", color: "#666", padding: "8px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                      <p><strong>Map Status:</strong> {geoData ? '✅ Loaded' : '⏳ Loading...'}</p>
                      <p><strong>Products:</strong> {productData.length} items</p>
                      <p><strong>Countries:</strong> {[...new Set(productData.map(p => p.location))].join(', ')}</p>
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
                              if (!value || value === 0) return '#f8fafc'; // Light grey for no data
                              
                              // Create a more distinct color gradient
                              const intensity = Math.min(1, value / maxQuantity);
                              
                              // Use a modern gradient with better differentiation
                              if (intensity < 0.2) return '#e0f2fe'; // Very light blue
                              if (intensity < 0.4) return '#bae6fd'; // Light blue
                              if (intensity < 0.6) return '#7dd3fc'; // Medium blue
                              if (intensity < 0.8) return '#38bdf8'; // Darker blue
                              return '#0ea5e9'; // Dark blue for highest values
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
                                  stroke={quantity > 0 ? "#0ea5e9" : "#e2e8f0"}
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
                                      fill: "#0284c7", 
                                      outline: "none",
                                      stroke: "#ffffff",
                                      strokeWidth: 3,
                                      cursor: "pointer"
                                    },
                                    pressed: { 
                                      outline: "none",
                                      fill: "#0369a1"
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
                        <h5>📊 Purchase Quantity Legend</h5>
                        <div className="legend-items">
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#f8fafc" }}></div>
                            <span>No Data</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#e0f2fe" }}></div>
                            <span>Low (0-20%)</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#bae6fd" }}></div>
                            <span>Medium (20-40%)</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#7dd3fc" }}></div>
                            <span>High (40-60%)</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#38bdf8" }}></div>
                            <span>Very High (60-80%)</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: "#0ea5e9" }}></div>
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
                        <p>🌍 Loading interactive world map...</p>
                      </div>
                    )}
                    {geoError && (
                      <div style={{ 
                        padding: "10px",
                        backgroundColor: "#fef3c7",
                        border: "1px solid #f59e0b",
                        borderRadius: "8px",
                        marginTop: "10px"
                      }}>
                        <p style={{ margin: 0, color: "#92400e" }}>
                          ⚠️ Map loading error: {geoError}. Using fallback data.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="chart">
                    <h4>🌍 Sales by Location (Geographical Distribution)</h4>
                    <Bar data={{
                      labels: dataBy('location', 'totalSales').keys,
                      datasets: [{
                        label: 'Total Sales ₹',
                        data: safeChartData(dataBy('location', 'totalSales').values),
                        backgroundColor: 'rgba(14, 165, 233, 0.8)',
                        borderColor: 'rgba(14, 165, 233, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={{ 
                      ...chartOptions, 
                      indexAxis: 'y',
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        },
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
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
                          ...chartOptions.scales.x,
                          title: {
                            display: true,
                            text: 'Total Sales (₹)'
                          }
                        },
                        y: {
                          ...chartOptions.scales.y,
                          title: {
                            display: true,
                            text: 'Location'
                          }
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>💰 Profit by Location</h4>
                    <Bar data={{
                      labels: dataBy('location', 'profit').keys,
                      datasets: [{
                        label: 'Total Profit ₹',
                        data: safeChartData(dataBy('location', 'profit').values),
                        backgroundColor: 'rgba(250, 112, 154, 0.8)',
                        borderColor: 'rgba(250, 112, 154, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={{ 
                      ...chartOptions, 
                      indexAxis: 'y',
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        },
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
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
                          ...chartOptions.scales.x,
                          title: {
                            display: true,
                            text: 'Total Profit (₹)'
                          }
                        },
                        y: {
                          ...chartOptions.scales.y,
                          title: {
                            display: true,
                            text: 'Location'
                          }
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>📊 Location Performance Comparison</h4>
                    <Bar data={{
                      labels: dataBy('location', 'totalSales').keys,
                      datasets: [
                        {
                          label: 'Sales ₹',
                          data: safeChartData(dataBy('location', 'totalSales').values),
                          backgroundColor: 'rgba(79, 172, 254, 0.8)',
                          borderColor: 'rgba(79, 172, 254, 1)',
                          borderWidth: 2,
                          borderRadius: 8,
                          borderSkipped: false
                        },
                        {
                          label: 'Profit ₹',
                          data: safeChartData(dataBy('location', 'profit').values),
                          backgroundColor: 'rgba(67, 233, 123, 0.8)',
                          borderColor: 'rgba(67, 233, 123, 1)',
                          borderWidth: 2,
                          borderRadius: 8,
                          borderSkipped: false
                        }
                      ]
                    }} options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
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
                          ...chartOptions.scales.y,
                          title: {
                            display: true,
                            text: 'Amount (₹)'
                          }
                        },
                        x: {
                          ...chartOptions.scales.x,
                          title: {
                            display: true,
                            text: 'Location'
                          }
                        }
                      }
                    }} />
                  </div>

                  <div className="chart">
                    <h4>🥧 Sales Distribution by Location</h4>
                    <Pie data={{
                      labels: dataBy('location', 'totalSales').keys,
                      datasets: [{
                        label: 'Sales ₹',
                        data: safeChartData(dataBy('location', 'totalSales').values),
                        backgroundColor: modernColorPalette,
                        borderColor: '#fff',
                        borderWidth: 3,
                        hoverBorderWidth: 5
                      }]
                    }} options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: 'right'
                        },
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            ...chartOptions.plugins.tooltip.callbacks,
                            label: function(context) {
                              // For Pie/Doughnut, use context.parsed or context.raw
                              const label = context.label || '';
                              const value = context.parsed !== undefined ? context.parsed : (context.raw !== undefined ? context.raw : 0);
                              return `${label}: ₹${value.toLocaleString('en-IN')}`;
                            }
                          }
                        }
                      }
                    }} />
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