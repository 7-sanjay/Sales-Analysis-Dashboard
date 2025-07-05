// Test script for chart data processing
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Mock the dataBy and averageBy functions for testing
const dataBy = (productData, key, valueKey) => {
  if (!productData || !Array.isArray(productData) || productData.length === 0) {
    console.log('dataBy: No product data available');
    return { keys: [], values: [] };
  }
  
  // Filter out null/undefined values and ensure we have valid data
  const validData = productData.filter(item => 
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
  
  return { keys: uniqueKeys, values };
};

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

async function testChartData() {
  try {
    console.log('🧪 Testing Chart Data Processing');
    console.log('================================\n');

    // 1. Fetch data from API
    console.log('1. Fetching data from API...');
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const productData = await response.json();
    console.log(`✅ Fetched ${productData.length} products`);

    // 2. Test category data processing
    console.log('\n2. Testing Category Data Processing...');
    const categoryData = dataBy(productData, 'category', 'totalSales');
    console.log('Category data:', categoryData);
    
    if (categoryData.keys.length > 0) {
      console.log('✅ Category data processing working');
      categoryData.keys.forEach((category, index) => {
        console.log(`   ${category}: ₹${categoryData.values[index].toLocaleString('en-IN')}`);
      });
    } else {
      console.log('❌ No category data found');
    }

    // 3. Test location data processing
    console.log('\n3. Testing Location Data Processing...');
    const locationData = dataBy(productData, 'location', 'totalSales');
    console.log('Location data:', locationData);
    
    if (locationData.keys.length > 0) {
      console.log('✅ Location data processing working');
      locationData.keys.forEach((location, index) => {
        console.log(`   ${location}: ₹${locationData.values[index].toLocaleString('en-IN')}`);
      });
    } else {
      console.log('❌ No location data found');
    }

    // 4. Test price data processing
    console.log('\n4. Testing Price Data Processing...');
    const prices = productData.map(item => item.price || 0).filter(price => price > 0);
    console.log('Price statistics:', {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      count: prices.length
    });

    // 5. Test dynamic price ranges
    console.log('\n5. Testing Dynamic Price Ranges...');
    const priceRanges = getDynamicPriceRanges(productData);
    console.log('Price ranges:', priceRanges);
    
    const priceHistogramData = priceRanges.map(range => ({
      label: range.label,
      count: productData.filter(item => (item.price || 0) >= range.min && (item.price || 0) < range.max).length
    })).filter(item => item.count > 0);
    
    console.log('Price histogram data:', priceHistogramData);
    
    if (priceHistogramData.length > 0) {
      console.log('✅ Price distribution processing working');
      priceHistogramData.forEach(item => {
        console.log(`   ${item.label}: ${item.count} products`);
      });
    } else {
      console.log('❌ No price distribution data found');
    }

    // 6. Test individual product data
    console.log('\n6. Testing Individual Product Data...');
    productData.forEach((product, index) => {
      console.log(`   Product ${index + 1}: ${product.productName}`);
      console.log(`     - Category: ${product.category}`);
      console.log(`     - Location: ${product.location}`);
      console.log(`     - Price: ₹${product.price}`);
      console.log(`     - Total Sales: ₹${product.totalSales}`);
      console.log(`     - Profit: ₹${product.profit}`);
      console.log('');
    });

    console.log('✅ All chart data processing tests completed!');
    console.log('\nSummary:');
    console.log(`- Total Products: ${productData.length}`);
    console.log(`- Categories: ${categoryData.keys.length}`);
    console.log(`- Locations: ${locationData.keys.length}`);
    console.log(`- Price Ranges: ${priceHistogramData.length}`);
    console.log(`- Price Range: ₹${Math.min(...prices)} - ₹${Math.max(...prices)}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testChartData(); 