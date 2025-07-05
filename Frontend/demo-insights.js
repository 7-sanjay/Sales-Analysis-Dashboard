// Demo script to show data-driven insights functionality
// This demonstrates how the enhanced insights work with real database data

const sampleProductData = [
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

// Simulate the data analysis function from openaiService.js
function prepareDataAnalysis(productData, chartData, chartType, chartTitle) {
  if (!productData || productData.length === 0) {
    return { message: 'No product data available for analysis' };
  }

  const analysis = {
    totalProducts: productData.length,
    totalRevenue: productData.reduce((sum, p) => sum + (p.totalSales || 0), 0),
    totalProfit: productData.reduce((sum, p) => sum + (p.profit || 0), 0),
    totalUnits: productData.reduce((sum, p) => sum + (p.quantity || 0), 0),
    averagePrice: productData.reduce((sum, p) => sum + (p.price || 0), 0) / productData.length,
    categories: [...new Set(productData.map(p => p.category))],
    locations: [...new Set(productData.map(p => p.location))],
    products: productData.map(p => p.productName),
    dateRange: {
      earliest: new Date(Math.min(...productData.map(p => new Date(p.time || p.createdAt)))),
      latest: new Date(Math.max(...productData.map(p => new Date(p.time || p.createdAt))))
    }
  };

  // Add category-specific analysis
  analysis.categoryAnalysis = {};
  analysis.categories.forEach(category => {
    const categoryProducts = productData.filter(p => p.category === category);
    analysis.categoryAnalysis[category] = {
      count: categoryProducts.length,
      totalRevenue: categoryProducts.reduce((sum, p) => sum + (p.totalSales || 0), 0),
      totalProfit: categoryProducts.reduce((sum, p) => sum + (p.profit || 0), 0),
      averagePrice: categoryProducts.reduce((sum, p) => sum + (p.price || 0), 0) / categoryProducts.length,
      products: categoryProducts.map(p => p.productName)
    };
  });

  // Add location-specific analysis
  analysis.locationAnalysis = {};
  analysis.locations.forEach(location => {
    const locationProducts = productData.filter(p => p.location === location);
    analysis.locationAnalysis[location] = {
      count: locationProducts.length,
      totalRevenue: locationProducts.reduce((sum, p) => sum + (p.totalSales || 0), 0),
      totalProfit: locationProducts.reduce((sum, p) => sum + (p.profit || 0), 0),
      averagePrice: locationProducts.reduce((sum, p) => sum + (p.price || 0), 0) / locationProducts.length
    };
  });

  // Add top performers
  analysis.topPerformers = {
    bestSellingProduct: productData.reduce((best, current) => 
      (current.totalSales > best.totalSales) ? current : best, { totalSales: 0 }),
    mostProfitableProduct: productData.reduce((best, current) => 
      (current.profit > best.profit) ? current : best, { profit: 0 }),
    highestPricedProduct: productData.reduce((best, current) => 
      (current.price > best.price) ? current : best, { price: 0 }),
    mostSoldProduct: productData.reduce((best, current) => 
      (current.quantity > best.quantity) ? current : best, { quantity: 0 })
  };

  return analysis;
}

// Simulate the fallback insights function
function getFallbackInsight(chartType, chartTitle, productData = []) {
  if (productData && productData.length > 0) {
    const totalRevenue = productData.reduce((sum, p) => sum + (p.totalSales || 0), 0);
    const totalProfit = productData.reduce((sum, p) => sum + (p.profit || 0), 0);
    const totalUnits = productData.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const categories = [...new Set(productData.map(p => p.category))];
    const locations = [...new Set(productData.map(p => p.location))];
    
    const bestSellingProduct = productData.reduce((best, current) => 
      (current.totalSales > best.totalSales) ? current : best, { totalSales: 0, productName: 'N/A' });
    
    const mostProfitableCategory = categories.reduce((best, category) => {
      const categoryProfit = productData.filter(p => p.category === category)
        .reduce((sum, p) => sum + (p.profit || 0), 0);
      return categoryProfit > best.profit ? { category, profit: categoryProfit } : best;
    }, { category: 'N/A', profit: 0 });

    const dataDrivenFallbacks = {
      'Category-wise Average Profit Margin (%)': `Based on ${productData.length} products across ${categories.length} categories, the average profit margin analysis reveals which categories generate the highest returns on investment.`,
      'Category-wise Average Selling Price': `The average selling price analysis across ${categories.length} categories shows pricing strategies and market positioning for different product segments.`,
      'Profitability Ratio per Category': `Profitability analysis reveals that ${mostProfitableCategory.category} leads with ₹${mostProfitableCategory.profit.toLocaleString('en-IN')} in total profit across all categories.`,
      'Total Revenue Over Time': `Revenue tracking shows total sales of ₹${totalRevenue.toLocaleString('en-IN')} across ${productData.length} products, with ${totalUnits} units sold.`,
      'Most Profitable Categories': `Category profitability analysis shows ${mostProfitableCategory.category} as the most profitable with ₹${mostProfitableCategory.profit.toLocaleString('en-IN')} in total profit.`,
      'Geographic Sales Distribution': `Geographic analysis shows sales distribution across ${locations.length} locations with total revenue of ₹${totalRevenue.toLocaleString('en-IN')}.`
    };

    return dataDrivenFallbacks[chartTitle] || `This ${chartType} chart analyzes ${productData.length} products across ${categories.length} categories and ${locations.length} locations, showing ${chartTitle.toLowerCase()}.`;
  }

  return `This ${chartType} chart shows ${chartTitle.toLowerCase()}. Hover over specific data points for detailed information.`;
}

// Demo the enhanced insights
console.log('🚀 Enhanced Data-Driven Insights Demo');
console.log('=====================================\n');

// Show data analysis
const analysis = prepareDataAnalysis(sampleProductData);
console.log('📊 Data Analysis Summary:');
console.log(`Total Products: ${analysis.totalProducts}`);
console.log(`Total Revenue: ₹${analysis.totalRevenue.toLocaleString('en-IN')}`);
console.log(`Total Profit: ₹${analysis.totalProfit.toLocaleString('en-IN')}`);
console.log(`Total Units: ${analysis.totalUnits}`);
console.log(`Categories: ${analysis.categories.join(', ')}`);
console.log(`Locations: ${analysis.locations.join(', ')}`);

console.log('\n🏆 Top Performers:');
console.log(`Best Selling Product: ${analysis.topPerformers.bestSellingProduct.productName} (₹${analysis.topPerformers.bestSellingProduct.totalSales.toLocaleString('en-IN')})`);
console.log(`Most Profitable Product: ${analysis.topPerformers.mostProfitableProduct.productName} (₹${analysis.topPerformers.mostProfitableProduct.profit.toLocaleString('en-IN')} profit)`);
console.log(`Highest Priced Product: ${analysis.topPerformers.highestPricedProduct.productName} (₹${analysis.topPerformers.highestPricedProduct.price.toLocaleString('en-IN')})`);
console.log(`Most Sold Product: ${analysis.topPerformers.mostSoldProduct.productName} (${analysis.topPerformers.mostSoldProduct.quantity} units)`);

console.log('\n📈 Category Analysis:');
Object.entries(analysis.categoryAnalysis).forEach(([category, data]) => {
  console.log(`${category}: ${data.count} products, ₹${data.totalRevenue.toLocaleString('en-IN')} revenue, ₹${data.totalProfit.toLocaleString('en-IN')} profit`);
});

console.log('\n🌍 Location Analysis:');
Object.entries(analysis.locationAnalysis).forEach(([location, data]) => {
  console.log(`${location}: ${data.count} products, ₹${data.totalRevenue.toLocaleString('en-IN')} revenue, ₹${data.totalProfit.toLocaleString('en-IN')} profit`);
});

console.log('\n💡 Example Data-Driven Insights:');
console.log('================================');

const chartTitles = [
  'Category-wise Average Profit Margin (%)',
  'Total Revenue Over Time',
  'Most Profitable Categories',
  'Geographic Sales Distribution'
];

chartTitles.forEach(title => {
  const insight = getFallbackInsight('Chart', title, sampleProductData);
  console.log(`\n${title}:`);
  console.log(`"${insight}"`);
});

console.log('\n✅ Demo completed!');
console.log('The enhanced insights now provide specific, actionable information based on your actual database data.'); 