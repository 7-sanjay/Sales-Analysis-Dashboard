const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Function to fetch analytics data from backend
export const fetchAnalyticsData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return null;
  }
};

export const generateChartInsight = async (chartData, chartType, chartTitle, productData = []) => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY in your environment variables.');
      return null;
    }

    // Validate input data
    if (!chartData || !chartType || !chartTitle) {
      console.warn('Invalid chart data provided for insight generation');
      return null;
    }

    // Fetch additional analytics data from backend
    const analyticsData = await fetchAnalyticsData();
    
    // Prepare comprehensive data analysis for insights
    const dataAnalysis = prepareDataAnalysis(productData, chartData, chartType, chartTitle, analyticsData);

    const prompt = `Analyze this business data and provide a detailed, numerical insight about the visualization. Use the actual data values and product information to generate meaningful business intelligence with specific numbers and metrics.

Chart Information:
- Type: ${chartType}
- Title: ${chartTitle}
- Chart Data: ${JSON.stringify(chartData, null, 2)}

Database Analysis:
${JSON.stringify(dataAnalysis, null, 2)}

Please provide a comprehensive, data-driven insight (minimum 30 words) that:
1. References specific numerical values from the actual data (prices, quantities, profits, percentages)
2. Identifies key trends or patterns with exact numbers
3. Provides actionable business intelligence with concrete metrics
4. Uses real product names, categories, or locations when relevant
5. Includes percentage changes, averages, or other statistical measures
6. Compares different categories, locations, or time periods with specific numbers
7. Mentions specific revenue, profit, and quantity figures from the database

Focus on what the data reveals about business performance, opportunities, or areas for improvement. Always include specific numerical analysis and ensure the insight is at least 30 words long.`;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a senior data analyst providing detailed, numerical insights about business charts and visualizations. Always reference actual data values with specific numbers, percentages, and metrics. Provide comprehensive analysis with at least 30 words that includes concrete business intelligence based on real product information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Validate response structure
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    return result.choices[0].message.content?.trim() || null;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('OpenAI API request timed out');
    } else {
      console.error('Error generating chart insight:', error);
    }
    return null;
  }
};

// Helper function to prepare comprehensive data analysis
const prepareDataAnalysis = (productData, chartData, chartType, chartTitle, analyticsData = null) => {
  if (!productData || productData.length === 0) {
    return { message: 'No product data available for analysis' };
  }

  // Use analytics data from backend if available, otherwise calculate locally
  const analysis = analyticsData ? {
    ...analyticsData,
    // Add chart-specific data
    chartData: {
      labels: chartData.labels || [],
      values: chartData.values || [],
      datasets: chartData.datasets || []
    }
  } : {
    totalProducts: productData.length,
    totalRevenue: productData.reduce((sum, p) => sum + (p.totalSales || 0), 0),
    totalProfit: productData.reduce((sum, p) => sum + (p.profit || 0), 0),
    totalUnits: productData.reduce((sum, p) => sum + (p.quantity || 0), 0),
    averagePrice: productData.reduce((sum, p) => sum + (p.price || 0), 0) / productData.length,
    averageProfit: productData.reduce((sum, p) => sum + (p.profit || 0), 0) / productData.length,
    averageQuantity: productData.reduce((sum, p) => sum + (p.quantity || 0), 0) / productData.length,
    categories: [...new Set(productData.map(p => p.category))],
    locations: [...new Set(productData.map(p => p.location))],
    products: productData.map(p => p.productName),
    dateRange: {
      earliest: new Date(Math.min(...productData.map(p => new Date(p.time || p.createdAt)))),
      latest: new Date(Math.max(...productData.map(p => new Date(p.time || p.createdAt))))
    }
  };

  // Calculate profit margins if not provided by analytics
  if (!analyticsData) {
    analysis.profitMargin = analysis.totalRevenue > 0 ? (analysis.totalProfit / analysis.totalRevenue) * 100 : 0;
    analysis.averageProfitMargin = productData.reduce((sum, p) => {
      const margin = p.totalSales > 0 ? (p.profit / p.totalSales) * 100 : 0;
      return sum + margin;
    }, 0) / productData.length;

    // Add category-specific analysis
    analysis.categoryAnalysis = {};
    analysis.categories.forEach(category => {
      const categoryProducts = productData.filter(p => p.category === category);
      const categoryRevenue = categoryProducts.reduce((sum, p) => sum + (p.totalSales || 0), 0);
      const categoryProfit = categoryProducts.reduce((sum, p) => sum + (p.profit || 0), 0);
      const categoryUnits = categoryProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
      
      analysis.categoryAnalysis[category] = {
        count: categoryProducts.length,
        totalRevenue: categoryRevenue,
        totalProfit: categoryProfit,
        totalUnits: categoryUnits,
        averagePrice: categoryProducts.reduce((sum, p) => sum + (p.price || 0), 0) / categoryProducts.length,
        averageProfit: categoryProfit / categoryProducts.length,
        averageQuantity: categoryUnits / categoryProducts.length,
        profitMargin: categoryRevenue > 0 ? (categoryProfit / categoryRevenue) * 100 : 0,
        revenueShare: (categoryRevenue / analysis.totalRevenue) * 100,
        profitShare: (categoryProfit / analysis.totalProfit) * 100,
        products: categoryProducts.map(p => p.productName)
      };
    });

    // Add location-specific analysis
    analysis.locationAnalysis = {};
    analysis.locations.forEach(location => {
      const locationProducts = productData.filter(p => p.location === location);
      const locationRevenue = locationProducts.reduce((sum, p) => sum + (p.totalSales || 0), 0);
      const locationProfit = locationProducts.reduce((sum, p) => sum + (p.profit || 0), 0);
      const locationUnits = locationProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
      
      analysis.locationAnalysis[location] = {
        count: locationProducts.length,
        totalRevenue: locationRevenue,
        totalProfit: locationProfit,
        totalUnits: locationUnits,
        averagePrice: locationProducts.reduce((sum, p) => sum + (p.price || 0), 0) / locationProducts.length,
        averageProfit: locationProfit / locationProducts.length,
        averageQuantity: locationUnits / locationProducts.length,
        profitMargin: locationRevenue > 0 ? (locationProfit / locationRevenue) * 100 : 0,
        revenueShare: (locationRevenue / analysis.totalRevenue) * 100,
        profitShare: (locationProfit / analysis.totalProfit) * 100
      };
    });

    // Add top performers with detailed metrics
    analysis.topPerformers = {
      bestSellingProduct: productData.reduce((best, current) => 
        (current.totalSales > best.totalSales) ? current : best, { totalSales: 0, productName: 'N/A' }),
      mostProfitableProduct: productData.reduce((best, current) => 
        (current.profit > best.profit) ? current : best, { profit: 0, productName: 'N/A' }),
      highestPricedProduct: productData.reduce((best, current) => 
        (current.price > best.price) ? current : best, { price: 0, productName: 'N/A' }),
      mostSoldProduct: productData.reduce((best, current) => 
        (current.quantity > best.quantity) ? current : best, { quantity: 0, productName: 'N/A' }),
      bestProfitMarginProduct: productData.reduce((best, current) => {
        const margin = current.totalSales > 0 ? (current.profit / current.totalSales) * 100 : 0;
        const bestMargin = best.totalSales > 0 ? (best.profit / best.totalSales) * 100 : 0;
        return margin > bestMargin ? current : best;
      }, { totalSales: 0, profit: 0, productName: 'N/A' })
    };

    // Add time-based analysis
    analysis.timeAnalysis = {
      hourlySales: Array(24).fill(0),
      dailySales: {},
      monthlySales: {}
    };

    productData.forEach(product => {
      if (product.time) {
        const date = new Date(product.time);
        if (!isNaN(date)) {
          const hour = date.getHours();
          const day = date.toDateString();
          const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
          
          analysis.timeAnalysis.hourlySales[hour] += (product.totalSales || 0);
          analysis.timeAnalysis.dailySales[day] = (analysis.timeAnalysis.dailySales[day] || 0) + (product.totalSales || 0);
          analysis.timeAnalysis.monthlySales[month] = (analysis.timeAnalysis.monthlySales[month] || 0) + (product.totalSales || 0);
        }
      }
    });

    // Find peak performance times
    analysis.peakPerformance = {
      peakHour: analysis.timeAnalysis.hourlySales.indexOf(Math.max(...analysis.timeAnalysis.hourlySales)),
      peakDay: Object.keys(analysis.timeAnalysis.dailySales).reduce((a, b) => 
        analysis.timeAnalysis.dailySales[a] > analysis.timeAnalysis.dailySales[b] ? a : b, ''),
      peakMonth: Object.keys(analysis.timeAnalysis.monthlySales).reduce((a, b) => 
        analysis.timeAnalysis.monthlySales[a] > analysis.timeAnalysis.monthlySales[b] ? a : b, '')
    };

    // Add statistical measures
    analysis.statistics = {
      priceRange: {
        min: Math.min(...productData.map(p => p.price || 0)),
        max: Math.max(...productData.map(p => p.price || 0)),
        median: productData.map(p => p.price || 0).sort((a, b) => a - b)[Math.floor(productData.length / 2)]
      },
      profitRange: {
        min: Math.min(...productData.map(p => p.profit || 0)),
        max: Math.max(...productData.map(p => p.profit || 0)),
        median: productData.map(p => p.profit || 0).sort((a, b) => a - b)[Math.floor(productData.length / 2)]
      },
      quantityRange: {
        min: Math.min(...productData.map(p => p.quantity || 0)),
        max: Math.max(...productData.map(p => p.quantity || 0)),
        median: productData.map(p => p.quantity || 0).sort((a, b) => a - b)[Math.floor(productData.length / 2)]
      }
    };
  }

  // Add chart-specific data
  analysis.chartData = {
    labels: chartData.labels || [],
    values: chartData.values || [],
    datasets: chartData.datasets || []
  };

  return analysis;
};

// Fallback insights for when OpenAI API is not available
export const getFallbackInsight = (chartType, chartTitle, productData = []) => {
  console.log('Getting fallback insight for:', chartType, chartTitle);
  
  // Generate data-driven fallback insights using actual product data
  if (productData && productData.length > 0) {
    const totalRevenue = productData.reduce((sum, p) => sum + (p.totalSales || 0), 0);
    const totalProfit = productData.reduce((sum, p) => sum + (p.profit || 0), 0);
    const totalUnits = productData.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const categories = [...new Set(productData.map(p => p.category))];
    const locations = [...new Set(productData.map(p => p.location))];
    const averagePrice = productData.reduce((sum, p) => sum + (p.price || 0), 0) / productData.length;
    const averageProfit = productData.reduce((sum, p) => sum + (p.profit || 0), 0) / productData.length;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    const bestSellingProduct = productData.reduce((best, current) => 
      (current.totalSales > best.totalSales) ? current : best, { totalSales: 0, productName: 'N/A' });
    
    const mostProfitableCategory = categories.reduce((best, category) => {
      const categoryProfit = productData.filter(p => p.category === category)
        .reduce((sum, p) => sum + (p.profit || 0), 0);
      return categoryProfit > best.profit ? { category, profit: categoryProfit } : best;
    }, { category: 'N/A', profit: 0 });

    const topLocation = locations.reduce((best, location) => {
      const locationRevenue = productData.filter(p => p.location === location)
        .reduce((sum, p) => sum + (p.totalSales || 0), 0);
      return locationRevenue > best.revenue ? { location, revenue: locationRevenue } : best;
    }, { location: 'N/A', revenue: 0 });

    const dataDrivenFallbacks = {
      'Category-wise Average Profit Margin (%)': `Based on analysis of ${productData.length} products across ${categories.length} categories, the average profit margin analysis reveals significant variations in profitability. The most profitable category is ${mostProfitableCategory.category} with ₹${mostProfitableCategory.profit.toLocaleString('en-IN')} in total profit, representing ${((mostProfitableCategory.profit / totalProfit) * 100).toFixed(1)}% of total profits.`,
      'Category-wise Average Selling Price': `The average selling price analysis across ${categories.length} categories shows pricing strategies and market positioning for different product segments. The overall average price is ₹${averagePrice.toFixed(2)}, with ${productData.length} total products analyzed. Price distribution varies significantly across categories, indicating different market segments and customer preferences.`,
      'Category-wise Product Sold': `Sales analysis across ${categories.length} categories shows a total of ${totalUnits} units sold among ${productData.length} products. The category with the highest sales volume demonstrates strong market demand, while others indicate opportunities for growth.`,
      'Profitability Ratio per Category': `Profitability analysis reveals that ${mostProfitableCategory.category} leads with ₹${mostProfitableCategory.profit.toLocaleString('en-IN')} in total profit across all categories, representing ${((mostProfitableCategory.profit / totalProfit) * 100).toFixed(1)}% of total profits. The average profit per product is ₹${averageProfit.toFixed(2)}, with a total profit margin of ${profitMargin.toFixed(1)}% across all ${productData.length} products.`,
      'Total Revenue Over Time': `Revenue tracking shows total sales of ₹${totalRevenue.toLocaleString('en-IN')} across ${productData.length} products, with ${totalUnits} units sold. The average revenue per product is ₹${(totalRevenue / productData.length).toFixed(2)}, indicating strong sales performance across all product categories and locations.`,
      'Average Selling Price per Product': `Price analysis across ${productData.length} products reveals the average selling price of ₹${averagePrice.toFixed(2)} with a range from ₹${Math.min(...productData.map(p => p.price || 0)).toFixed(2)} to ₹${Math.max(...productData.map(p => p.price || 0)).toFixed(2)}. This pricing distribution shows ${categories.length} different categories with varying price points to serve different market segments.`,
      'Top Categories by Total Revenue': `Revenue distribution shows ${categories.length} categories contributing to the total revenue of ₹${totalRevenue.toLocaleString('en-IN')}. The best performing category generates significant revenue, with ${totalUnits} total units sold across all products. Category performance varies by ${((Math.max(...productData.map(p => p.totalSales || 0)) - Math.min(...productData.map(p => p.totalSales || 0))) / averagePrice * 100).toFixed(1)}% between highest and lowest performers.`,
      'Price Distribution Analysis': `Price range analysis of ${productData.length} products shows the distribution of products across different price segments, with an average price of ₹${averagePrice.toFixed(2)}. The price range spans from ₹${Math.min(...productData.map(p => p.price || 0)).toFixed(2)} to ₹${Math.max(...productData.map(p => p.price || 0)).toFixed(2)}, indicating diverse product offerings across ${categories.length} categories and ${locations.length} locations.`,
      'Profit Margin per Product': `Profit margin analysis reveals individual product profitability across ${productData.length} products, with an average profit margin of ${profitMargin.toFixed(1)}%. The total profit of ₹${totalProfit.toLocaleString('en-IN')} represents strong financial performance, with ${totalUnits} units sold generating substantial returns across all product categories.`,
      'Total Profit Over Time': `Profit tracking shows total profit of ₹${totalProfit.toLocaleString('en-IN')} with ${totalUnits} units sold across all products. The average profit per product is ₹${averageProfit.toFixed(2)}, with a profit margin of ${profitMargin.toFixed(1)}% indicating healthy financial performance across ${productData.length} products in ${categories.length} categories.`,
      'Most Profitable Categories': `Category profitability analysis shows ${mostProfitableCategory.category} as the most profitable with ₹${mostProfitableCategory.profit.toLocaleString('en-IN')} in total profit, representing ${((mostProfitableCategory.profit / totalProfit) * 100).toFixed(1)}% of total profits. The average profit margin across all ${productData.length} products is ${profitMargin.toFixed(1)}%, with significant variations across ${categories.length} different categories.`,
      'Profit vs Sales Correlation': `Correlation analysis between profit and sales across ${productData.length} products reveals efficiency patterns with a total profit of ₹${totalProfit.toLocaleString('en-IN')} and total revenue of ₹${totalRevenue.toLocaleString('en-IN')}. The profit margin of ${profitMargin.toFixed(1)}% indicates strong correlation between sales volume and profitability across all product categories.`,
      'Quantity Sold per Product': `Sales volume analysis shows ${totalUnits} total units sold across ${productData.length} products, with an average of ${(totalUnits / productData.length).toFixed(1)} units per product. The best selling product is ${bestSellingProduct.productName} with ${bestSellingProduct.quantity || 0} units sold, representing ${((bestSellingProduct.quantity || 0) / totalUnits * 100).toFixed(1)}% of total sales volume.`,
      'Product Performance Comparison': `Performance comparison across ${productData.length} products shows ${bestSellingProduct.productName} as the best seller with ₹${bestSellingProduct.totalSales.toLocaleString('en-IN')} in sales. The average revenue per product is ₹${(totalRevenue / productData.length).toFixed(2)}, with total revenue of ₹${totalRevenue.toLocaleString('en-IN')} and total profit of ₹${totalProfit.toLocaleString('en-IN')} across all products.`,
      'Sales Trend Analysis': `Trend analysis across ${productData.length} products reveals sales patterns and seasonal variations with total revenue of ₹${totalRevenue.toLocaleString('en-IN')} and ${totalUnits} units sold. The average daily sales performance shows consistent growth patterns across ${categories.length} categories and ${locations.length} locations, indicating strong market demand.`,
      'Geographic Sales Distribution': `Geographic analysis shows sales distribution across ${locations.length} locations with total revenue of ₹${totalRevenue.toLocaleString('en-IN')}. The top performing location is ${topLocation.location} with ₹${topLocation.revenue.toLocaleString('en-IN')} in revenue, representing ${((topLocation.revenue / totalRevenue) * 100).toFixed(1)}% of total sales across all ${productData.length} products.`,
      'Sales by Location': `Location-based sales analysis across ${locations.length} locations shows regional performance variations with total revenue of ₹${totalRevenue.toLocaleString('en-IN')}. The top location generates ₹${topLocation.revenue.toLocaleString('en-IN')} in sales, representing ${((topLocation.revenue / totalRevenue) * 100).toFixed(1)}% of total revenue, with ${totalUnits} units sold across all locations.`,
      'Profit by Location': `Geographic profitability analysis reveals profit patterns across ${locations.length} different locations with total profit of ₹${totalProfit.toLocaleString('en-IN')}. The average profit per location is ₹${(totalProfit / locations.length).toFixed(2)}, with significant variations in profitability across different regions and ${productData.length} total products.`,
      'Location Performance Comparison': `Regional performance comparison across ${locations.length} locations shows both sales and profit variations with total revenue of ₹${totalRevenue.toLocaleString('en-IN')} and total profit of ₹${totalProfit.toLocaleString('en-IN')}. The top performing location generates ${((topLocation.revenue / totalRevenue) * 100).toFixed(1)}% of total revenue, indicating strong regional market performance.`,
      'Sales Distribution by Location': `Geographic distribution analysis shows how sales are distributed across ${locations.length} locations with total revenue of ₹${totalRevenue.toLocaleString('en-IN')} and ${totalUnits} units sold. The average revenue per location is ₹${(totalRevenue / locations.length).toFixed(2)}, with the top location contributing ${((topLocation.revenue / totalRevenue) * 100).toFixed(1)}% of total sales volume.`
    };

    return dataDrivenFallbacks[chartTitle] || `Analysis of ${productData.length} products shows total revenue of ₹${totalRevenue.toLocaleString('en-IN')}, total profit of ₹${totalProfit.toLocaleString('en-IN')}, and ${totalUnits} units sold across ${categories.length} categories and ${locations.length} locations. The average profit margin is ${profitMargin.toFixed(1)}% with significant variations in performance across different product segments and geographic regions.`;
  }

  return `No product data available for analysis. Please add products through the form to generate meaningful insights.`;
}; 