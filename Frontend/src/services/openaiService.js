// Function to fetch analytics data from backend
const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const fetchAnalyticsData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/analytics`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return null;
  }
};

export const generateChartInsight = async (chartData) => {
  try {
    // Send chartData to backend Gemini endpoint
    const response = await fetch(`${BASE_URL}/api/generate-insight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chartData }),
    });
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    const result = await response.json();
    return result.insight || null;
  } catch (error) {
    console.error('Error generating chart insight:', error);
    return null;
  }
};

// Fallback insights for when Gemini API is not available
export const getFallbackInsight = (chartType, chartTitle, productData = [], chartData = {}) => {
  // Try to generate a chart-specific fallback using chartData
  if (chartData && chartData.labels && chartData.values && chartData.labels.length > 0 && chartData.values.length > 0) {
    // Find top and bottom values
    const maxIdx = chartData.values.indexOf(Math.max(...chartData.values));
    const minIdx = chartData.values.indexOf(Math.min(...chartData.values));
    const maxLabel = chartData.labels[maxIdx];
    const minLabel = chartData.labels[minIdx];
    const maxValue = chartData.values[maxIdx];
    const minValue = chartData.values[minIdx];
    const total = chartData.values.reduce((a, b) => a + b, 0);
    const avg = chartData.values.reduce((a, b) => a + b, 0) / chartData.values.length;
    return `This visualization shows data for ${chartData.labels.length} groups. The highest value is for '${maxLabel}' (${maxValue}), and the lowest is for '${minLabel}' (${minValue}). The total across all groups is ${total}, with an average of ${avg.toFixed(2)} per group. This chart highlights the distribution and key differences between groups.`;
  }
  // Fallback to previous logic if no chartData
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