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
import { generateChartInsight, getFallbackInsight } from '../../services/openaiService';
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
  "Russia": "Russia",
  // Alternative mappings
  "USA": "United States of America",
  "UK": "United Kingdom",
  "US": "United States of America",
  // Add more variations as needed
};

// Add a helper for the AI button
const AIButton = ({ onClick, isLoading, isActive }) => (
  <button
    className={`ai-insight-btn${isActive ? ' active' : ''}`}
    onClick={onClick}
    style={{
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 10,
      background: isActive ? '#667eea' : '#fff',
      color: isActive ? '#fff' : '#667eea',
      border: '2px solid #667eea',
      borderRadius: '50%',
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      cursor: 'pointer',
      boxShadow: isActive ? '0 2px 8px rgba(102,126,234,0.15)' : 'none',
      transition: 'all 0.2s',
    }}
    title="Show AI Insight"
    disabled={isLoading}
  >
    {isLoading ? (
      <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
    ) : (
      <img src={isActive ? "/gemini1.png" : "/gemini.png"} alt="Gemini AI" style={{ width: 20, height: 20, objectFit: 'contain' }} />
    )}
  </button>
);

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
  const [chartInsights, setChartInsights] = useState({});
  const [hoveredChart, setHoveredChart] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [activeInsight, setActiveInsight] = useState(null);
  const [monthlyTrendMetric, setMonthlyTrendMetric] = useState('revenue');
  const [top5View, setTop5View] = useState('products'); // 'products' or 'categories'
  const [quantityCategoryFilter, setQuantityCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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
      title: '📊 Prediction & Trends',
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
        setGeoData(null);
      }
    };
    fetchGeoData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
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
        
        // Debug: Log category data
        const categoryData = dataBy('category', 'totalSales');
        console.log('Category data for visualization:', categoryData);
        console.log('Available categories:', categoryData.keys);
        console.log('Sales by category:', categoryData.values);
        
        // Debug: Log price data
        const prices = response.data.map(item => item.price || 0).filter(price => price > 0);
        console.log('Price data:', {
          min: Math.min(...prices),
          max: Math.max(...prices),
          average: prices.reduce((a, b) => a + b, 0) / prices.length,
          count: prices.length
        });
        
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
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state && location.state.section) {
      setActiveSection(location.state.section);
    } else if (location.state && location.state.fromHomeNav) {
      setActiveSection('home');
    }
  }, [location.state]);

  // Cleanup insights when component unmounts or data changes
  useEffect(() => {
    return () => {
      setChartInsights({});
      setHoveredChart(null);
      setInsightLoading(false);
    };
  }, [productData]);

  // Chart hover handler for insights
  const handleChartHover = async (chartTitle, chartType, chartData) => {
    setHoveredChart(chartTitle);
    if (chartInsights[chartTitle]) return;
    if (insightLoading) return;
    setInsightLoading(true);
    try {
      if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        setChartInsights(prev => ({ ...prev, [chartTitle]: 'No valid chart data for insight.' }));
        return;
      }
      const insight = await generateChartInsight({ chartTitle, chartType, chartData });
      if (insight && insight.trim()) {
        setChartInsights(prev => ({ ...prev, [chartTitle]: insight }));
      } else {
        // Request backend deterministic summary when model returns empty
        const fallback = await generateChartInsight({ chartTitle, chartType, chartData });
        setChartInsights(prev => ({ ...prev, [chartTitle]: fallback || '' }));
      }
    } catch (error) {
      setChartInsights(prev => ({ ...prev, [chartTitle]: 'Could not generate insight.' }));
    } finally {
      setInsightLoading(false);
    }
  };

  const handleChartLeave = () => {
    setHoveredChart(null);
  };

  // Utility function to safely prepare chart data for API
  const prepareChartDataForAPI = (chartData) => {
    try {
      console.log('Preparing chart data for API:', chartData);
      
      // Limit data size to prevent API token limits
      const limitedData = {
        labels: chartData.labels?.slice(0, 10) || [],
        values: chartData.values?.slice(0, 10) || [],
        summary: {
          totalItems: chartData.labels?.length || 0,
          maxValue: Math.max(...(chartData.values || [0])),
          minValue: Math.min(...(chartData.values || [0])),
          averageValue: chartData.values?.length > 0 ? 
            chartData.values.reduce((a, b) => a + b, 0) / chartData.values.length : 0
        }
      };
      
      console.log('Prepared data for API:', limitedData);
      return limitedData;
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return { labels: [], values: [], summary: { totalItems: 0, maxValue: 0, minValue: 0, averageValue: 0 } };
    }
  };

  // Price range histogram data - Dynamic ranges based on actual data
  const getDynamicPriceRanges = (data) => {
    if (!data || data.length === 0) return [];
    
    const prices = data.map(item => item.price || 0).filter(price => price > 0);
    if (prices.length === 0) return [];
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    
    // Create dynamic ranges based on actual data
    const numRanges = Math.min(8, Math.max(5, Math.ceil(range / 10000))); // 5-8 ranges
    const step = range / numRanges;
    
    const ranges = [];
    for (let i = 0; i < numRanges; i++) {
      const min = minPrice + (i * step);
      const max = minPrice + ((i + 1) * step);
      const label = `₹${Math.round(min/1000)}K-${Math.round(max/1000)}K`;
      ranges.push({ min, max, label });
    }
    
    return ranges;
  };

  const filteredProductData = React.useMemo(() => {
    if (!dateFrom && !dateTo) return productData;
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    return (productData || []).filter(item => {
      if (!item.time) return false;
      const t = new Date(item.time);
      if (isNaN(t)) return false;
      if (from && t < from) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23,59,59,999);
        if (t > end) return false;
      }
      return true;
    });
  }, [productData, dateFrom, dateTo]);

  const priceRanges = getDynamicPriceRanges(filteredProductData);
  const priceHistogramData = priceRanges.map(range => ({
    label: range.label,
    count: filteredProductData.filter(item => (item.price || 0) >= range.min && (item.price || 0) < range.max).length
  })).filter(item => item.count > 0); // Only show ranges with data

  // Enhanced dataBy function with better error handling
  const dataBy = (key, valueKey) => {
    if (!filteredProductData || !Array.isArray(filteredProductData) || filteredProductData.length === 0) {
      console.log('dataBy: No product data available');
      return { keys: [], values: [] };
    }
    
    // Filter out null/undefined values and ensure we have valid data
    const validData = filteredProductData.filter(item => 
      item[key] && item[key] !== null && item[key] !== undefined &&
      (item[valueKey] !== null && item[valueKey] !== undefined)
    );
    
    if (validData.length === 0) {
      console.log(`dataBy: No valid data for ${key} and ${valueKey}`);
      return { keys: [], values: [] };
    }
    
    const uniqueKeys = [...new Set(validData.map(item => item[key]))];
    const values = uniqueKeys.map(k => {
      const items = validData.filter(item => item[key] === k);
      return items.reduce((acc, item) => acc + (Number(item[valueKey]) || 0), 0);
    });
    
    console.log(`dataBy(${key}, ${valueKey}):`, { keys: uniqueKeys, values });
    return { keys: uniqueKeys, values };
  };

  const averageBy = (key, valueKey) => {
    if (!filteredProductData || !Array.isArray(filteredProductData) || filteredProductData.length === 0) {
      console.log('averageBy: No product data available');
      return { keys: [], values: [] };
    }
    
    // Filter out null/undefined values and ensure we have valid data
    const validData = filteredProductData.filter(item => 
      item[key] && item[key] !== null && item[key] !== undefined &&
      (item[valueKey] !== null && item[valueKey] !== undefined)
    );
    
    if (validData.length === 0) {
      console.log(`averageBy: No valid data for ${key} and ${valueKey}`);
      return { keys: [], values: [] };
    }
    
    const uniqueKeys = [...new Set(validData.map(item => item[key]))];
    const values = uniqueKeys.map(k => {
      const items = validData.filter(item => item[key] === k);
      const sum = items.reduce((acc, item) => acc + (Number(item[valueKey]) || 0), 0);
      return items.length > 0 ? sum / items.length : 0;
    });
    
    console.log(`averageBy(${key}, ${valueKey}):`, { keys: uniqueKeys, values });
    return { keys: uniqueKeys, values };
  };

  // Helper function to safely format chart data
  const safeChartData = (data, defaultValue = 0) => {
    return data.map(item => item !== undefined && item !== null ? item : defaultValue);
  };

  // const profitByLocation = dataBy('location', 'profit'); // Removed unused variable

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
  // Best Selling Product (by overall quantity sold across all entries)
  const productQuantityMap = {};
  filteredProductData.forEach(item => {
    if (!item.productName) return;
    productQuantityMap[item.productName] = (productQuantityMap[item.productName] || 0) + (item.quantity || 0);
  });
  let bestSellingProductName = 'N/A';
  let bestSellingProductQuantity = 0;
  Object.entries(productQuantityMap).forEach(([name, qty]) => {
    if (qty > bestSellingProductQuantity) {
      bestSellingProductName = name;
      bestSellingProductQuantity = qty;
    }
  });
  const bestSellingProduct = { productName: bestSellingProductName, quantity: bestSellingProductQuantity };
  
  const mostProfitableCategory = dataBy('category', 'profit');
  const topCategory = mostProfitableCategory.keys[mostProfitableCategory.values.indexOf(Math.max(...mostProfitableCategory.values))];

  // Most Purchased Category (by quantity)
  const mostPurchasedCategoryData = dataBy('category', 'quantity');
  const mostPurchasedCategory = mostPurchasedCategoryData.keys[mostPurchasedCategoryData.values.indexOf(Math.max(...mostPurchasedCategoryData.values))];

  // Most Purchased Country (by quantity)
  const mostPurchasedCountryData = dataBy('location', 'quantity');
  const mostPurchasedCountry = mostPurchasedCountryData.keys[mostPurchasedCountryData.values.indexOf(Math.max(...mostPurchasedCountryData.values))];

  // Top 5 products by sales
  const topProducts = [...filteredProductData]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  // Peak Sales Hour (by total sales)
  let peakSalesHour = 'N/A';
  if (filteredProductData.length > 0) {
    // Try to extract hour from the 'time' field (assuming it's a string or Date)
    const hourSales = {};
    filteredProductData.forEach(item => {
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
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

  // Helper to filter by time (assumes p.time is ISO string or Date)
  function isInRange(item, from, to) {
    if (!item.time) return false;
    const t = typeof item.time === 'string' ? new Date(item.time) : item.time;
    return t >= from && t < to;
  }

  // Calculate sums for last 3 days and previous 3 days
  function sumByTimeWindow(key) {
    const last3 = filteredProductData.filter(p => isInRange(p, threeDaysAgo, now)).reduce((acc, p) => acc + (p[key] || 0), 0);
    const prev3 = filteredProductData.filter(p => isInRange(p, sixDaysAgo, threeDaysAgo)).reduce((acc, p) => acc + (p[key] || 0), 0);
    const total = filteredProductData.reduce((acc, p) => acc + (p[key] || 0), 0);
    return { last3, prev3, total };
  }

  function percentChange(last, prev) {
    if (prev === 0) {
      if (last > 0) return 100; // All new data, show 100% up
      if (last < 0) return -100; // Should not happen for sales, but handle
      return 0; // Both zero
    }
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

  // Insight Tooltip Component
  const InsightTooltip = ({ chartTitle, isVisible, isLoading, insight }) => {
    console.log('InsightTooltip render:', { chartTitle, isVisible, isLoading, insight: insight ? insight.substring(0, 50) + '...' : 'null' });
    
    if (!isVisible) return null;

    return (
      <div className="insight-tooltip">
        <div className="insight-header">
          <span className="insight-icon">💡</span>
          <span className="insight-title">Chart Insight</span>
        </div>
        <div className="insight-content">
          {isLoading ? (
            <div className="insight-loading">
              <div className="loading-spinner"></div>
              <span>Generating insight...</span>
            </div>
          ) : (
            <p className="insight-text">{insight || ''}</p>
          )}
        </div>
      </div>
    );
  };

  const handleInsightButton = async (chartTitle, chartType, chartData) => {
    if (activeInsight === chartTitle) {
      setActiveInsight(null);
      return;
    }
    setActiveInsight(chartTitle);
    if (chartInsights[chartTitle]) return;
    setInsightLoading(true);
    try {
      const insight = await generateChartInsight(chartData);
      setChartInsights(prev => ({ ...prev, [chartTitle]: insight || 'Could not generate insight.' }));
    } catch (e) {
      // On error, try one more time to let backend generate a deterministic summary
      try {
        const fallback = await generateChartInsight({ chartTitle, chartType, chartData });
        setChartInsights(prev => ({ ...prev, [chartTitle]: fallback || '' }));
      } catch (_) {
        setChartInsights(prev => ({ ...prev, [chartTitle]: '' }));
      }
    } finally {
      setInsightLoading(false);
    }
  };

  // Before KPI cards
  console.log('KPI productData:', filteredProductData);

  // Helper for safe sparkline data
  function safeSparklineData(arr) {
    if (!arr || arr.length === 0 || arr.every(v => !v || v === 0)) {
      // Return a flat line or a single zero
      return [0];
    }
    return arr;
  }

  // Helper to group data by month
  function groupByMonth(data, valueKey) {
    const monthly = {};
    data.forEach(item => {
      if (item.time) {
        const date = new Date(item.time);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthly[monthKey] = (monthly[monthKey] || 0) + (item[valueKey] || 0);
      }
    });
    const sortedMonths = Object.keys(monthly).sort((a, b) => new Date(a) - new Date(b));
    return { labels: sortedMonths, values: sortedMonths.map(m => monthly[m]) };
  }

  // Build Category x Month matrix for a heatmap (using totalSales by default)
  function computeCategoryMonthMatrix(valueKey = 'totalSales') {
    const categoriesSet = new Set();
    const monthsSet = new Set();
    (filteredProductData || []).forEach(item => {
      if (!item.time) return;
      const monthKey = new Date(item.time).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthsSet.add(monthKey);
      if (item.category) categoriesSet.add(item.category);
    });
    const months = Array.from(monthsSet).sort((a, b) => new Date(a) - new Date(b));
    const categories = Array.from(categoriesSet);
    const indexByCat = Object.fromEntries(categories.map((c, i) => [c, i]));
    const indexByMonth = Object.fromEntries(months.map((m, i) => [m, i]));
    const matrix = Array.from({ length: categories.length }, () => Array.from({ length: months.length }, () => 0));
    (filteredProductData || []).forEach(item => {
      if (!item.time || !item.category) return;
      const monthKey = new Date(item.time).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const r = indexByCat[item.category];
      const c = indexByMonth[monthKey];
      if (r != null && c != null) {
        matrix[r][c] += item[valueKey] || 0;
      }
    });
    return { categories, months, matrix };
  }

  // Linear regression util (least squares)
  function linearRegression(xs, ys) {
    if (!xs || !ys || xs.length !== ys.length || xs.length < 2) {
      return { slope: 0, intercept: ys && ys.length ? ys[ys.length - 1] : 0 };
    }
    const n = xs.length;
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
    const sumXX = xs.reduce((acc, x) => acc + x * x, 0);
    const denom = n * sumXX - sumX * sumX;
    if (denom === 0) return { slope: 0, intercept: sumY / n };
    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
  }

  // Forecast next k months from monthly totals using simple linear regression
  function forecastNextMonths(monthLabels, monthValues, k = 3) {
    const xs = monthValues.map((_, i) => i);
    const { slope, intercept } = linearRegression(xs, monthValues);
    const forecasts = [];
    const nextLabels = [];
    // Parse last month and add sequential months
    const lastLabel = monthLabels[monthLabels.length - 1];
    const startDate = lastLabel ? new Date(lastLabel) : new Date();
    const d = new Date(startDate.getTime());
    for (let i = 1; i <= k; i++) {
      d.setMonth(d.getMonth() + 1);
      nextLabels.push(d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
      const x = xs.length - 1 + i;
      forecasts.push(slope * x + intercept);
    }
    return { nextLabels, forecasts };
  }

  // Compute per-product trend (slope of metric over time index)
  function computeProductTrends(metricKey = 'quantity') {
    const byProduct = {};
    (filteredProductData || []).forEach(item => {
      if (!item.productName || !item.time) return;
      const t = new Date(item.time);
      if (isNaN(t)) return;
      const key = item.productName;
      if (!byProduct[key]) byProduct[key] = [];
      byProduct[key].push({ t, v: item[metricKey] || 0 });
    });
    const trends = Object.entries(byProduct).map(([name, arr]) => {
      const sorted = arr.sort((a, b) => a.t - b.t);
      const ys = sorted.map(p => p.v);
      const xs = sorted.map((_, i) => i);
      const { slope } = linearRegression(xs, ys);
      return { name, slope };
    });
    const rising = trends.filter(t => t.slope > 0).sort((a, b) => b.slope - a.slope).slice(0, 5);
    const declining = trends.filter(t => t.slope < 0).sort((a, b) => a.slope - b.slope).slice(0, 5);
    return { rising, declining };
  }

  // Price elasticity (log-log slope between price and quantity), grouped by category
  function computePriceElasticityByCategory() {
    const byCat = {};
    (productData || []).forEach(item => {
      const cat = item.category || 'Unknown';
      if (!byCat[cat]) byCat[cat] = [];
      if (item.price && item.quantity) {
        byCat[cat].push({ price: item.price, quantity: item.quantity });
      }
    });
    const elasticity = Object.entries(byCat).map(([cat, arr]) => {
      const points = arr.filter(p => p.price > 0 && p.quantity > 0);
      if (points.length < 2) return { category: cat, e: 0 };
      const xs = points.map(p => Math.log(p.price));
      const ys = points.map(p => Math.log(p.quantity));
      const { slope } = linearRegression(xs, ys);
      return { category: cat, e: slope };
    });
    return elasticity;
  }

  const topCategories = (() => {
    const categorySales = {};
    productData.forEach(p => {
      if (p.category) categorySales[p.category] = (categorySales[p.category] || 0) + (p.totalSales || 0);
    });
    return Object.entries(categorySales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, totalSales]) => ({ category, totalSales }));
  })();

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
              Add Product
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
            Add Product
          </button>
          <button className="go-home-button" onClick={() => navigate('/inventory')}>
            Inventory
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
          {/* Global Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, justifyContent: 'flex-end' }}>
            <label style={{ fontSize: 12, color: '#556', opacity: 0.9, marginRight: 4 }}>From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{
                padding: '0.3rem 0.7rem',
                borderRadius: 6,
                fontSize: '1rem',
                fontWeight: 500,
                background: '#fff',
                border: '1.2px solid #e2e8f0',
                color: '#333',
                outline: 'none',
                minWidth: 160
              }}
            />
            <label style={{ fontSize: 12, color: '#556', opacity: 0.9, marginLeft: 6, marginRight: 4 }}>To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{
                padding: '0.3rem 0.7rem',
                borderRadius: 6,
                fontSize: '1rem',
                fontWeight: 500,
                background: '#fff',
                border: '1.2px solid #e2e8f0',
                color: '#333',
                outline: 'none',
                minWidth: 160
              }}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                style={{
                  padding: '0.3rem 0.7rem',
                  borderRadius: 6,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  background: '#fff',
                  border: '1.2px solid #e2e8f0',
                  color: '#333',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>
          {/* KPI Cards - Only show in Home section */}
          {activeSection === 'home' && (
            <div className="kpi-cards">
              <div className="kpi-card">
                <h3>💰 Total Revenue</h3>
                <p>₹{filteredProductData.reduce((acc, p) => acc + (p.totalSales || 0), 0).toLocaleString('en-IN')}</p>
                <Sparklines data={safeSparklineData(filteredProductData.map(p => p.totalSales || 0))} height={30} margin={5}>
                  <SparklinesLine color="#667eea" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
                <div className="kpi-change-row">
                  <span className="kpi-change-value">{renderChange(revenueChange, true)}</span>
                  <span className="kpi-change-label">Since last 3 days</span>
                </div>
              </div>
              <div className="kpi-card">
                <h3>📈 Total Profit</h3>
                <p>₹{filteredProductData.reduce((acc, p) => acc + (p.profit || 0), 0).toLocaleString('en-IN')}</p>
                <Sparklines data={safeSparklineData(filteredProductData.map(p => p.profit || 0))} height={30} margin={5}>
                  <SparklinesLine color="#f093fb" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
                <div className="kpi-change-row">
                  <span className="kpi-change-value">{renderChange(profitChange, true)}</span>
                  <span className="kpi-change-label">Since last 3 days</span>
                </div>
              </div>
              <div className="kpi-card">
                <h3>📦 Total Units Sold</h3>
                <p>{filteredProductData.reduce((acc, p) => acc + (p.quantity || 0), 0).toLocaleString('en-IN')}</p>
                <Sparklines data={safeSparklineData(filteredProductData.map(p => p.quantity || 0))} height={30} margin={5}>
                  <SparklinesLine color="#4facfe" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
                <div className="kpi-change-row">
                  <span className="kpi-change-value">{renderChange(unitsChange, true)}</span>
                  <span className="kpi-change-label">Since last 3 days</span>
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
                <Sparklines data={safeSparklineData(filteredProductData.filter(p => p.category === mostPurchasedCategory).map(p => p.quantity || 0))} height={30} margin={5}>
                  <SparklinesLine color="#43e97b" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
              </div>
              <div className="kpi-card">
                <h3>🌍 Top Purchasing Country</h3>
                <p>{mostPurchasedCountry || 'N/A'}</p>
                <Sparklines data={safeSparklineData(filteredProductData.filter(p => p.location === mostPurchasedCountry).map(p => p.quantity || 0))} height={30} margin={5}>
                  <SparklinesLine color="#fa709a" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
              </div>
              <div className="kpi-card">
                <h3>⏰ Peak Sales Hours</h3>
                <p>{peakSalesHour}</p>
                <Sparklines data={safeSparklineData((() => {
                  // Build array of sales by hour (0-23)
                  const hourSalesArr = Array(24).fill(0);
                  filteredProductData.forEach(item => {
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
                })())} height={30} margin={5}>
                  <SparklinesLine color="#a8edea" style={{ fill: "none", strokeWidth: 3 }} />
                </Sparklines>
              </div>
            </div>
          )}

          {/* Chart Sections */}
          <div className="chart-sections">
            {/* Prediction & Trends */}
            {activeSection === 'kpis' && (
              <div className="chart-section">
                <h3>📊 Prediction & Trends</h3>
                <div className="chart-grid">
                  {/* Sales Forecasting: Next 3 months (linear regression) */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Sales Forecast (3 months)',
                        'Line',
                        (() => {
                          const monthly = groupByMonth(filteredProductData, 'totalSales');
                          const { nextLabels, forecasts } = forecastNextMonths(monthly.labels, monthly.values, 3);
                          return prepareChartDataForAPI({
                            labels: [...monthly.labels, ...nextLabels],
                            values: [...monthly.values, ...forecasts]
                          });
                        })()
                      )}
                      isLoading={insightLoading && activeInsight === 'Sales Forecast (3 months)'}
                      isActive={activeInsight === 'Sales Forecast (3 months)'}
                    />
                    <h4>🔮 Sales Forecast (Next 3 Months)</h4>
                    {(() => {
                      const monthly = groupByMonth(filteredProductData, 'totalSales');
                      const { nextLabels, forecasts } = forecastNextMonths(monthly.labels, monthly.values, 3);
                      return (
                        <Line
                          data={{
                            labels: [...monthly.labels, ...nextLabels],
                            datasets: [
                              {
                                label: 'Historical Revenue ₹',
                                data: safeChartData(monthly.values),
                                borderColor: 'rgba(102, 126, 234, 1)',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                fill: true,
                                tension: 0.3,
                                borderWidth: 3
                              },
                              {
                                label: 'Forecast ₹',
                                data: safeChartData([...new Array(monthly.values.length - 1).fill(null), monthly.values[monthly.values.length - 1], ...forecasts]),
                                borderColor: 'rgba(67, 233, 123, 1)',
                                backgroundColor: 'rgba(67, 233, 123, 0.1)',
                                borderDash: [8, 6],
                                tension: 0.3,
                                borderWidth: 3
                              }
                            ]
                          }}
                          options={chartOptions}
                        />
                      );
                    })()}
                    {activeInsight === 'Sales Forecast (3 months)' && (
                      <InsightTooltip
                        chartTitle="Sales Forecast (3 months)"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Sales Forecast (3 months)'}
                        insight={chartInsights['Sales Forecast (3 months)']}
                      />
                    )}
                  </div>

                  {/* Product/Service Trends: Rising and Declining */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Top Rising & Declining Products',
                        'Bar',
                        (() => {
                          const { rising, declining } = computeProductTrends('quantity');
                          return prepareChartDataForAPI({
                            labels: [...rising.map(r => r.name), ...declining.map(d => d.name)],
                            values: [...rising.map(r => r.slope), ...declining.map(d => d.slope)]
                          });
                        })()
                      )}
                      isLoading={insightLoading && activeInsight === 'Top Rising & Declining Products'}
                      isActive={activeInsight === 'Top Rising & Declining Products'}
                    />
                    <h4>📊 Product Trends: Rising vs Declining</h4>
                    {(() => {
                      const { rising, declining } = computeProductTrends('quantity');
                      return (
                        <Bar
                          data={{
                            labels: [...rising.map(r => `⬆️ ${r.name}`), ...declining.map(d => `⬇️ ${d.name}`)],
                            datasets: [
                              {
                                label: 'Trend Slope (Quantity over Time Index)',
                                data: safeChartData([...rising.map(r => r.slope), ...declining.map(d => d.slope)]),
                                backgroundColor: [...rising.map(() => 'rgba(67, 233, 123, 0.8)'), ...declining.map(() => 'rgba(245, 87, 108, 0.8)')],
                                borderColor: [...rising.map(() => 'rgba(67, 233, 123, 1)'), ...declining.map(() => 'rgba(245, 87, 108, 1)')],
                                borderWidth: 2,
                                borderRadius: 8,
                                borderSkipped: false
                              }
                            ]
                          }}
                          options={chartOptions}
                        />
                      );
                    })()}
                    {activeInsight === 'Top Rising & Declining Products' && (
                      <InsightTooltip
                        chartTitle="Top Rising & Declining Products"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Top Rising & Declining Products'}
                        insight={chartInsights['Top Rising & Declining Products']}
                      />
                    )}
                  </div>

                  {/* Category x Month Heatmap */}
                  <div className="chart" style={{ position: 'relative' }}>
                    <h4>🔥 Category × Month Heatmap (Revenue)</h4>
                    {(() => {
                      const { categories, months, matrix } = computeCategoryMonthMatrix('totalSales');
                      const allValues = matrix.flat();
                      const maxVal = Math.max(...allValues, 1);
                      function colorFor(value) {
                        const pct = Math.max(0, Math.min(1, value / maxVal));
                        if (pct <= 0.20) return '#FFF3BF'; // very light (pale yellow)
                        if (pct <= 0.40) return '#FFD591'; // light (soft orange)
                        if (pct <= 0.60) return '#FFA940'; // medium (moderate orange)
                        if (pct <= 0.80) return '#FA8C16'; // darker (strong orange)
                        return '#D4380D'; // very dark / deep red
                      }
                      return (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${months.length}, minmax(64px, 1fr))`, gap: 4 }}>
                            <div style={{ fontWeight: 600 }}></div>
                            {months.map(m => (
                              <div key={m} style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, lineHeight: '1', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m}</div>
                            ))}
                            {categories.map((cat, r) => (
                              <React.Fragment key={cat}>
                                <div style={{ position: 'sticky', left: 0, background: '#fff', fontWeight: 600, padding: '4px 6px', borderRadius: 4, fontSize: 12, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{cat}</div>
                                {months.map((m, c) => {
                                  const val = matrix[r][c] || 0;
                                  return (
                                    <div key={`${cat}-${m}`} title={`${cat} — ${m}: ₹${val.toLocaleString('en-IN')}`}
                                         style={{ height: 22, borderRadius: 4, background: colorFor(val), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.75)', fontSize: 10 }}>
                                      {val ? `₹${(val/1000).toFixed(0)}k` : ''}
                                    </div>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  {/* Category-wise Average Profit Margin (%) */}
                  {/* Category-wise Product Sold */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Category-wise Product Sold',
                        'Radar',
                        prepareChartDataForAPI({
                          labels: dataBy('category', 'quantity').keys,
                          values: dataBy('category', 'quantity').values
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Category-wise Product Sold'}
                      isActive={activeInsight === 'Category-wise Product Sold'}
                    />
                    <h4>📊 Category-wise Product Sold</h4>
                    <Radar data={{
                      labels: dataBy('category', 'quantity').keys,
                      datasets: [{
                        label: 'Quantity Sold',
                        data: safeChartData(dataBy('category', 'quantity').values),
                        backgroundColor: 'rgba(67, 233, 123, 0.2)',
                        borderColor: 'rgba(67, 233, 123, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(67, 233, 123, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(67, 233, 123, 1)'
                      }]
                    }} options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            ...chartOptions.plugins.tooltip.callbacks,
                            label: function(context) {
                              const value = context.parsed.r || 0;
                              return `${context.dataset.label}: ${value.toLocaleString('en-IN')}`;
                            }
                          }
                        }
                      },
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
                    {activeInsight === 'Category-wise Product Sold' && (
                      <InsightTooltip
                        chartTitle="Category-wise Product Sold"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Category-wise Product Sold'}
                        insight={chartInsights['Category-wise Product Sold']}
                      />
                    )}
                  </div>
                  {/* Removed: Category-wise Average Selling Price (replaced by heatmap) */}
                </div>
              </div>
            )}

            {/* Revenue / Price-Related Visualizations */}
            {activeSection === 'revenue' && (
              <div className="chart-section">
                <h3>💰 Revenue & Price Analysis</h3>
                <div className="chart-grid">
                  {/* Total Revenue Over Time */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Total Revenue Over Time',
                        'Line',
                        prepareChartDataForAPI({
                          labels: filteredProductData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
                          values: filteredProductData.map(p => p.totalSales)
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Total Revenue Over Time'}
                      isActive={activeInsight === 'Total Revenue Over Time'}
                    />
                    <h4>📈 Total Revenue Over Time</h4>
                    <Line data={{
                      labels: filteredProductData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
                      datasets: [{
                        label: 'Revenue ₹',
                        data: safeChartData(filteredProductData.map(p => p.totalSales)),
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
                    {activeInsight === 'Total Revenue Over Time' && (
                      <InsightTooltip
                        chartTitle="Total Revenue Over Time"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Total Revenue Over Time'}
                        insight={chartInsights['Total Revenue Over Time']}
                      />
                    )}
                  </div>
                  {/* Average Selling Price per Product */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Average Selling Price per Product',
                        'Bar',
                        prepareChartDataForAPI({
                          labels: averageBy('productName', 'price').keys,
                          values: averageBy('productName', 'price').values
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Average Selling Price per Product'}
                      isActive={activeInsight === 'Average Selling Price per Product'}
                    />
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
                    {activeInsight === 'Average Selling Price per Product' && (
                      <InsightTooltip
                        chartTitle="Average Selling Price per Product"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Average Selling Price per Product'}
                        insight={chartInsights['Average Selling Price per Product']}
                      />
                    )}
                  </div>
                  {/* Top Categories by Total Revenue */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Top Categories by Total Revenue',
                        'Doughnut',
                        prepareChartDataForAPI({
                          labels: dataBy('category', 'totalSales').keys,
                          values: dataBy('category', 'totalSales').values
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Top Categories by Total Revenue'}
                      isActive={activeInsight === 'Top Categories by Total Revenue'}
                    />
                    <h4>🏆 Top Categories by Total Revenue</h4>
                    {dataBy('category', 'totalSales').keys.length > 0 ? (
                      <Doughnut data={{
                        labels: dataBy('category', 'totalSales').keys,
                        datasets: [{
                          label: 'Revenue ₹',
                          data: safeChartData(dataBy('category', 'totalSales').values),
                          backgroundColor: modernColorPalette.slice(0, dataBy('category', 'totalSales').keys.length),
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
                          },
                          tooltip: {
                            ...chartOptions.plugins.tooltip,
                            callbacks: {
                              label: function(context) {
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }} />
                    ) : (
                      <div style={{ 
                        height: "300px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px"
                      }}>
                        <p>No category data available</p>
                      </div>
                    )}
                    {activeInsight === 'Top Categories by Total Revenue' && (
                      <InsightTooltip
                        chartTitle="Top Categories by Total Revenue"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Top Categories by Total Revenue'}
                        insight={chartInsights['Top Categories by Total Revenue']}
                      />
                    )}
                  </div>
                  {/* Price Distribution Analysis */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Price Distribution Analysis',
                        'Bar',
                        prepareChartDataForAPI({
                          labels: priceHistogramData.map(d => d.label),
                          values: priceHistogramData.map(d => d.count)
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Price Distribution Analysis'}
                      isActive={activeInsight === 'Price Distribution Analysis'}
                    />
                    <h4>💎 Price Distribution Analysis</h4>
                    {priceHistogramData.length > 0 ? (
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
                      }} options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          tooltip: {
                            ...chartOptions.plugins.tooltip,
                            callbacks: {
                              label: function(context) {
                                const value = context.parsed.y || 0;
                                const total = productData.length;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `Products: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            ...chartOptions.scales.y,
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Products'
                            }
                          },
                          x: {
                            ...chartOptions.scales.x,
                            title: {
                              display: true,
                              text: 'Price Range'
                            }
                          }
                        }
                      }} />
                    ) : (
                      <div style={{ 
                        height: "300px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px"
                      }}>
                        <p>No price data available</p>
                      </div>
                    )}
                    {activeInsight === 'Price Distribution Analysis' && (
                      <InsightTooltip
                        chartTitle="Price Distribution Analysis"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Price Distribution Analysis'}
                        insight={chartInsights['Price Distribution Analysis']}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profit-Related Visualizations */}
            {activeSection === 'profit' && (
              <div className="chart-section">
                <h3>📈 Profit Analytics</h3>
                <div className="chart-grid">
                  {/* Profit Margin per Product */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Profit Margin per Product',
                        'Bar',
                        prepareChartDataForAPI({
                          labels: filteredProductData.map(p => p.productName || 'Unknown'),
                          values: filteredProductData.map(p => p.price ? ((p.profit / p.price) * 100) : 0)
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Profit Margin per Product'}
                      isActive={activeInsight === 'Profit Margin per Product'}
                    />
                    <h4>📊 Profit Margin per Product</h4>
                    <Bar data={{
                      labels: filteredProductData.map(p => p.productName || 'Unknown'),
                      datasets: [{
                        label: 'Profit Margin %',
                        data: safeChartData(filteredProductData.map(p => p.price ? ((p.profit / p.price) * 100) : 0)),
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
                    {activeInsight === 'Profit Margin per Product' && (
                      <InsightTooltip
                        chartTitle="Profit Margin per Product"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Profit Margin per Product'}
                        insight={chartInsights['Profit Margin per Product']}
                      />
                    )}
                  </div>
                  {/* Total Profit Over Time */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Total Profit Over Time',
                        'Line',
                        prepareChartDataForAPI({
                          labels: filteredProductData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
                          values: filteredProductData.map(p => p.profit)
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Total Profit Over Time'}
                      isActive={activeInsight === 'Total Profit Over Time'}
                    />
                    <h4>📈 Total Profit Over Time</h4>
                    <Line data={{
                      labels: filteredProductData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
                      datasets: [{
                        label: 'Profit ₹',
                        data: safeChartData(filteredProductData.map(p => p.profit)),
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
                    {activeInsight === 'Total Profit Over Time' && (
                      <InsightTooltip
                        chartTitle="Total Profit Over Time"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Total Profit Over Time'}
                        insight={chartInsights['Total Profit Over Time']}
                      />
                    )}
                  </div>
                  {/* Most Profitable Categories */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Most Profitable Categories',
                        'Bar',
                        prepareChartDataForAPI({
                          labels: dataBy('category', 'profit').keys,
                          values: dataBy('category', 'profit').values
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Most Profitable Categories'}
                      isActive={activeInsight === 'Most Profitable Categories'}
                    />
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
                    {activeInsight === 'Most Profitable Categories' && (
                      <InsightTooltip
                        chartTitle="Most Profitable Categories"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Most Profitable Categories'}
                        insight={chartInsights['Most Profitable Categories']}
                      />
                    )}
                  </div>
                  {/* Profit vs Sales Correlation */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Profit vs Sales Correlation',
                        'Scatter',
                        prepareChartDataForAPI({
                          labels: productData.filter(p => p.totalSales !== undefined && p.totalSales !== null && p.profit !== undefined && p.profit !== null).map(p => p.productName),
                          values: productData.filter(p => p.totalSales !== undefined && p.totalSales !== null && p.profit !== undefined && p.profit !== null).map(p => ({ x: p.totalSales, y: p.profit }))
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Profit vs Sales Correlation'}
                      isActive={activeInsight === 'Profit vs Sales Correlation'}
                    />
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
                    {activeInsight === 'Profit vs Sales Correlation' && (
                      <InsightTooltip
                        chartTitle="Profit vs Sales Correlation"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Profit vs Sales Correlation'}
                        insight={chartInsights['Profit vs Sales Correlation']}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Product Sales */}
            {activeSection === 'quantity' && (
              <div className="chart-section">
                <h3>📦 Quantity & Product Sales</h3>
                <div className="chart-grid">
                  {/* Quantity Sold per Product */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Quantity Sold per Product',
                        'Bar',
                        (() => {
                          const selected = quantityCategoryFilter;
                          const filtered = (filteredProductData || []).filter(p => selected === 'all' || p.category === selected);
                          const byProduct = {};
                          filtered.forEach(p => {
                            const key = p.productName || 'Unknown';
                            byProduct[key] = (byProduct[key] || 0) + (p.quantity || 0);
                          });
                          const labels = Object.keys(byProduct);
                          const values = labels.map(l => byProduct[l]);
                          return prepareChartDataForAPI({ labels, values });
                        })()
                      )}
                      isLoading={insightLoading && activeInsight === 'Quantity Sold per Product'}
                      isActive={activeInsight === 'Quantity Sold per Product'}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h4 style={{ margin: 0, marginRight: 12, fontWeight: 600, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 6 }}>📊 Quantity Sold per Product</h4>
                        <select
                          value={quantityCategoryFilter}
                          onChange={e => setQuantityCategoryFilter(e.target.value)}
                          style={{
                            padding: '0.3rem 0.7rem',
                            borderRadius: 6,
                            fontSize: '1rem',
                            fontWeight: 500,
                            background: '#fff',
                            border: '1.2px solid #e2e8f0',
                            color: '#333',
                            outline: 'none',
                            marginLeft: 'auto',
                            minWidth: 100,
                            alignSelf: 'center',
                            marginTop: '-2px'
                          }}
                        >
                          <option value="all">All</option>
                          {Array.from(new Set((filteredProductData || []).map(p => p.category).filter(Boolean))).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {(() => {
                      const selected = quantityCategoryFilter;
                      const filtered = (filteredProductData || []).filter(p => selected === 'all' || p.category === selected);
                      const byProduct = {};
                      filtered.forEach(p => {
                        const key = p.productName || 'Unknown';
                        byProduct[key] = (byProduct[key] || 0) + (p.quantity || 0);
                      });
                      const labels = Object.keys(byProduct);
                      const values = labels.map(l => byProduct[l]);
                      return (
                        <Bar data={{
                          labels,
                          datasets: [{
                            label: 'Quantity',
                            data: safeChartData(values),
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
                      );
                    })()}
                    {activeInsight === 'Quantity Sold per Product' && (
                      <InsightTooltip
                        chartTitle="Quantity Sold per Product"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Quantity Sold per Product'}
                        insight={chartInsights['Quantity Sold per Product']}
                      />
                    )}
                  </div>
                  {/* Top 5 Best-Selling Products */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AIButton
                          onClick={() => handleInsightButton(
                            top5View === 'products' ? 'Top 5 Best-Selling Products' : 'Top 5 Best-Selling Categories',
                            'Bar',
                            prepareChartDataForAPI({
                              labels: top5View === 'products' ? topProducts.map(p => p.productName || 'Unknown') : topCategories.map(c => c.category),
                              values: top5View === 'products' ? topProducts.map(p => p.totalSales) : topCategories.map(c => c.totalSales)
                            })
                          )}
                          isLoading={insightLoading && activeInsight === (top5View === 'products' ? 'Top 5 Best-Selling Products' : 'Top 5 Best-Selling Categories')}
                          isActive={activeInsight === (top5View === 'products' ? 'Top 5 Best-Selling Products' : 'Top 5 Best-Selling Categories')}
                        />
                        <h4 style={{ margin: 0, marginRight: 12, fontWeight: 600, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span role="img" aria-label="Top 5">🏆</span> Top 5
                        </h4>
                        <select
                          value={top5View}
                          onChange={e => setTop5View(e.target.value)}
                          style={{
                            padding: '0.3rem 0.7rem',
                            borderRadius: 6,
                            fontSize: '1rem',
                            fontWeight: 500,
                            background: '#fff',
                            border: '1.2px solid #e2e8f0',
                            color: '#333',
                            outline: 'none',
                            marginLeft: 'auto',
                            minWidth: 100,
                            alignSelf: 'center',
                            marginTop: '-2px'
                          }}
                        >
                          <option value="products">Product</option>
                          <option value="categories">Category</option>
                        </select>
                      </div>
                    </div>
                    <Bar data={{
                      labels: top5View === 'products' ? topProducts.map(p => p.productName || 'Unknown') : topCategories.map(c => c.category),
                      datasets: [{
                        label: top5View === 'products' ? 'Sales ₹' : 'Category Sales ₹',
                        data: top5View === 'products' ? topProducts.map(p => p.totalSales) : topCategories.map(c => c.totalSales),
                        backgroundColor: modernColorPalette.slice(0, 5),
                        borderColor: modernColorPalette.slice(0, 5).map(color => color.replace('0.8', '1')),
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={chartOptions} />
                    {activeInsight === (top5View === 'products' ? 'Top 5 Best-Selling Products' : 'Top 5 Best-Selling Categories') && (
                      <InsightTooltip
                        chartTitle={top5View === 'products' ? 'Top 5 Best-Selling Products' : 'Top 5 Best-Selling Categories'}
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === (top5View === 'products' ? 'Top 5 Best-Selling Products' : 'Top 5 Best-Selling Categories')}
                        insight={chartInsights[top5View === 'products' ? 'Top 5 Best-Selling Products' : 'Top 5 Best-Selling Categories']}
                      />
                    )}
                  </div>
                  {/* Category-wise Product Sales */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Category-wise Product Sales',
                        'Bar',
                        prepareChartDataForAPI({
                          labels: dataBy('category', 'quantity').keys,
                          values: dataBy('category', 'quantity').values
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Category-wise Product Sales'}
                      isActive={activeInsight === 'Category-wise Product Sales'}
                    />
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
                    {activeInsight === 'Category-wise Product Sales' && (
                      <InsightTooltip
                        chartTitle="Category-wise Product Sales"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Category-wise Product Sales'}
                        insight={chartInsights['Category-wise Product Sales']}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Time & Trend Analysis */}
            {activeSection === 'time' && (
              <div className="chart-section">
                <h3>⏰ Time & Trend Analysis</h3>
                <div className="chart-grid">
                  {/* Monthly Sales Trend with Dropdown */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Monthly Trend',
                        'Bar',
                        prepareChartDataForAPI({
                          labels: groupByMonth(filteredProductData, monthlyTrendMetric === 'revenue' ? 'totalSales' : monthlyTrendMetric).labels,
                          values: groupByMonth(filteredProductData, monthlyTrendMetric === 'revenue' ? 'totalSales' : monthlyTrendMetric).values
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Monthly Trend'}
                      isActive={activeInsight === 'Monthly Trend'}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ margin: 0, marginRight: 16 }}>📈 Monthly Trend</h4>
                      <select
                        value={monthlyTrendMetric}
                        onChange={e => setMonthlyTrendMetric(e.target.value)}
                        style={{ padding: '0.3rem 0.7rem', borderRadius: 6, fontSize: '1rem' }}
                      >
                        <option value="revenue">Monthly Revenue</option>
                        <option value="quantity">Monthly Product Sold</option>
                        <option value="profit">Monthly Profit</option>
                      </select>
                    </div>
                    <Bar data={{
                      labels: groupByMonth(filteredProductData, monthlyTrendMetric === 'revenue' ? 'totalSales' : monthlyTrendMetric).labels,
                      datasets: [{
                        label:
                          monthlyTrendMetric === 'revenue' ? 'Revenue ₹' :
                          monthlyTrendMetric === 'quantity' ? 'Product Sold' :
                          'Profit ₹',
                        data: groupByMonth(filteredProductData, monthlyTrendMetric === 'revenue' ? 'totalSales' : monthlyTrendMetric).values,
                        backgroundColor:
                          monthlyTrendMetric === 'revenue' ? 'rgba(102, 126, 234, 0.8)' :
                          monthlyTrendMetric === 'quantity' ? 'rgba(67, 233, 123, 0.8)' :
                          'rgba(250, 112, 154, 0.8)',
                        borderColor:
                          monthlyTrendMetric === 'revenue' ? 'rgba(102, 126, 234, 1)' :
                          monthlyTrendMetric === 'quantity' ? 'rgba(67, 233, 123, 1)' :
                          'rgba(250, 112, 154, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                      }]
                    }} options={chartOptions} />
                    {activeInsight === 'Monthly Trend' && (
                      <InsightTooltip
                        chartTitle="Monthly Trend"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Monthly Trend'}
                        insight={chartInsights['Monthly Trend']}
                      />
                    )}
                  </div>

                  {/* Remove or comment out the old Daily Sales Trend chart here */}
                  {/* <div className="chart">
                    <h4>📈 Daily Sales Trend</h4>
                    <Line data={{
                      labels: filteredProductData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
                      datasets: [{
                        label: 'Sales ₹',
                        data: safeChartData(filteredProductData.map(p => p.totalSales)),
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
                  </div> */}

                  {/* <div className="chart">
                    <h4>🎯 Time vs Category Sales</h4>
                    <Line data={{
                      labels: filteredProductData.map(p => p.time ? new Date(p.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'),
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
                  </div> */}

                  {/* Sales by Date with Quantity - Additional Chart */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => {
                        // Group quantity by date
                        const quantityByDate = {};
                        productData.forEach(item => {
                          if (item.time) {
                            const date = new Date(item.time);
                            const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            quantityByDate[dateKey] = (quantityByDate[dateKey] || 0) + (item.quantity || 0);
                          }
                        });
                        
                        const sortedDates = Object.keys(quantityByDate).sort((a, b) => new Date(a) - new Date(b));
                        
                        handleInsightButton(
                          'Quantity Sold by Date',
                          'Bar',
                          prepareChartDataForAPI({
                            labels: sortedDates,
                            values: sortedDates.map(date => quantityByDate[date])
                          })
                        );
                      }}
                      isLoading={insightLoading && activeInsight === 'Quantity Sold by Date'}
                      isActive={activeInsight === 'Quantity Sold by Date'}
                    />
                    <h4>📦 Quantity Sold by Date</h4>
                    <Bar data={{
                      labels: (() => {
                        const quantityByDate = {};
                        productData.forEach(item => {
                          if (item.time) {
                            const date = new Date(item.time);
                            const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            quantityByDate[dateKey] = (quantityByDate[dateKey] || 0) + (item.quantity || 0);
                          }
                        });
                        return Object.keys(quantityByDate).sort((a, b) => new Date(a) - new Date(b));
                      })(),
                      datasets: [{
                        label: 'Total Quantity',
                        data: (() => {
                          const quantityByDate = {};
                          productData.forEach(item => {
                            if (item.time) {
                              const date = new Date(item.time);
                              const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                              quantityByDate[dateKey] = (quantityByDate[dateKey] || 0) + (item.quantity || 0);
                            }
                          });
                          const sortedDates = Object.keys(quantityByDate).sort((a, b) => new Date(a) - new Date(b));
                          return safeChartData(sortedDates.map(date => quantityByDate[date]));
                        })(),
                        backgroundColor: 'rgba(67, 233, 123, 0.8)',
                        borderColor: 'rgba(67, 233, 123, 1)',
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
                              const value = context.parsed.y || 0;
                              return `Quantity: ${value.toLocaleString('en-IN')} units`;
                            }
                          }
                        }
                      }
                    }} />
                    {activeInsight === 'Quantity Sold by Date' && (
                      <InsightTooltip
                        chartTitle="Quantity Sold by Date"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Quantity Sold by Date'}
                        insight={chartInsights['Quantity Sold by Date']}
                      />
                    )}
                  </div>

                  {/* Sales Trend by Date - Line Chart */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => {
                        // Group sales by date
                        const salesByDate = {};
                        productData.forEach(item => {
                          if (item.time) {
                            const date = new Date(item.time);
                            const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            salesByDate[dateKey] = (salesByDate[dateKey] || 0) + (item.totalSales || 0);
                          }
                        });
                        
                        const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
                        
                        handleInsightButton(
                          'Sales Trend by Date',
                          'Line',
                          prepareChartDataForAPI({
                            labels: sortedDates,
                            values: sortedDates.map(date => salesByDate[date])
                          })
                        );
                      }}
                      isLoading={insightLoading && activeInsight === 'Sales Trend by Date'}
                      isActive={activeInsight === 'Sales Trend by Date'}
                    />
                    <h4>📈 Sales Trend by Date</h4>
                    <Line data={{
                      labels: (() => {
                        const salesByDate = {};
                        productData.forEach(item => {
                          if (item.time) {
                            const date = new Date(item.time);
                            const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            salesByDate[dateKey] = (salesByDate[dateKey] || 0) + (item.totalSales || 0);
                          }
                        });
                        return Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
                      })(),
                      datasets: [{
                        label: 'Total Sales ₹',
                        data: (() => {
                          const salesByDate = {};
                          productData.forEach(item => {
                            if (item.time) {
                              const date = new Date(item.time);
                              const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                              salesByDate[dateKey] = (salesByDate[dateKey] || 0) + (item.totalSales || 0);
                            }
                          });
                          const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
                          return safeChartData(sortedDates.map(date => salesByDate[date]));
                        })(),
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
                              const value = context.parsed.y || 0;
                              return `Sales: ₹${value.toLocaleString('en-IN')}`;
                            }
                          }
                        }
                      }
                    }} />
                    {activeInsight === 'Sales Trend by Date' && (
                      <InsightTooltip
                        chartTitle="Sales Trend by Date"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Sales Trend by Date'}
                        insight={chartInsights['Sales Trend by Date']}
                      />
                    )}
                  </div>

                  {/* Combined Sales and Quantity by Date */}
                  <div className="chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => {
                        // Group both sales and quantity by date
                        const salesByDate = {};
                        const quantityByDate = {};
                        productData.forEach(item => {
                          if (item.time) {
                            const date = new Date(item.time);
                            const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            salesByDate[dateKey] = (salesByDate[dateKey] || 0) + (item.totalSales || 0);
                            quantityByDate[dateKey] = (quantityByDate[dateKey] || 0) + (item.quantity || 0);
                          }
                        });
                        
                        const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
                        
                        handleInsightButton(
                          'Sales vs Quantity by Date',
                          'Line',
                          prepareChartDataForAPI({
                            labels: sortedDates,
                            values: [
                              sortedDates.map(date => salesByDate[date]),
                              sortedDates.map(date => quantityByDate[date])
                            ]
                          })
                        );
                      }}
                      isLoading={insightLoading && activeInsight === 'Sales vs Quantity by Date'}
                      isActive={activeInsight === 'Sales vs Quantity by Date'}
                    />
                    <h4>📊 Sales vs Quantity by Date</h4>
                    <Line data={{
                      labels: (() => {
                        const salesByDate = {};
                        productData.forEach(item => {
                          if (item.time) {
                            const date = new Date(item.time);
                            const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            salesByDate[dateKey] = (salesByDate[dateKey] || 0) + (item.totalSales || 0);
                          }
                        });
                        return Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
                      })(),
                      datasets: [
                        {
                          label: 'Total Sales ₹',
                          data: (() => {
                            const salesByDate = {};
                            productData.forEach(item => {
                              if (item.time) {
                                const date = new Date(item.time);
                                const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                                salesByDate[dateKey] = (salesByDate[dateKey] || 0) + (item.totalSales || 0);
                              }
                            });
                            const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
                            return safeChartData(sortedDates.map(date => salesByDate[date]));
                          })(),
                          borderColor: 'rgba(79, 172, 254, 1)',
                          backgroundColor: 'rgba(79, 172, 254, 0.1)',
                          tension: 0.4,
                          fill: false,
                          borderWidth: 3,
                          pointBackgroundColor: 'rgba(79, 172, 254, 1)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 5,
                          pointHoverRadius: 8,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Total Quantity',
                          data: (() => {
                            const quantityByDate = {};
                            productData.forEach(item => {
                              if (item.time) {
                                const date = new Date(item.time);
                                const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                                quantityByDate[dateKey] = (quantityByDate[dateKey] || 0) + (item.quantity || 0);
                              }
                            });
                            const sortedDates = Object.keys(quantityByDate).sort((a, b) => new Date(a) - new Date(b));
                            return safeChartData(sortedDates.map(date => quantityByDate[date]));
                          })(),
                          borderColor: 'rgba(67, 233, 123, 1)',
                          backgroundColor: 'rgba(67, 233, 123, 0.1)',
                          tension: 0.4,
                          fill: false,
                          borderWidth: 3,
                          pointBackgroundColor: 'rgba(67, 233, 123, 1)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 5,
                          pointHoverRadius: 8,
                          yAxisID: 'y1'
                        }
                      ]
                    }} options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Sales (₹)'
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                            display: true,
                            text: 'Quantity (units)'
                          },
                          grid: {
                            drawOnChartArea: false,
                          },
                        }
                      },
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            ...chartOptions.plugins.tooltip.callbacks,
                            label: function(context) {
                              const value = context.parsed.y || 0;
                              if (context.dataset.label === 'Total Sales ₹') {
                                return `Sales: ₹${value.toLocaleString('en-IN')}`;
                              } else {
                                return `Quantity: ${value.toLocaleString('en-IN')} units`;
                              }
                            }
                          }
                        }
                      }
                    }} />
                    {activeInsight === 'Sales vs Quantity by Date' && (
                      <InsightTooltip
                        chartTitle="Sales vs Quantity by Date"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Sales vs Quantity by Date'}
                        insight={chartInsights['Sales vs Quantity by Date']}
                      />
                    )}
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
                  <div className="chart map-chart chart-with-insight" style={{ position: 'relative' }}>
                    <AIButton
                      onClick={() => handleInsightButton(
                        'Purchase Quantity by Country',
                        'Map',
                        prepareChartDataForAPI({
                          labels: Object.keys(productData.reduce((acc, item) => {
                            if (item.location) acc[item.location] = true;
                            return acc;
                          }, {})),
                          values: Object.values(productData.reduce((acc, item) => {
                            if (item.location) acc[item.location] = (acc[item.location] || 0) + (item.quantity || 0);
                            return acc;
                          }, {}))
                        })
                      )}
                      isLoading={insightLoading && activeInsight === 'Purchase Quantity by Country'}
                      isActive={activeInsight === 'Purchase Quantity by Country'}
                    />
                    <h4>🗺️ Purchase Quantity by Country</h4>
                    <ReactTooltip>{tooltipContent}</ReactTooltip>
                    {/* Debug info */}
                    {/* Remove this block:
                    <div style={{ marginBottom: "10px", fontSize: "12px", color: "#666", padding: "8px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                      <p><strong>Map Status:</strong> {geoData ? '✅ Loaded' : '⏳ Loading...'}</p>
                      <p><strong>Products:</strong> {productData.length} items</p>
                      <p><strong>Countries:</strong> {[...new Set(filteredProductData.map(p => p.location))].join(', ')}</p>
                    </div>
                    */}
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
                    {activeInsight === 'Purchase Quantity by Country' && (
                      <InsightTooltip
                        chartTitle="Purchase Quantity by Country"
                        isVisible={true}
                        isLoading={insightLoading && activeInsight === 'Purchase Quantity by Country'}
                        insight={chartInsights['Purchase Quantity by Country']}
                      />
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