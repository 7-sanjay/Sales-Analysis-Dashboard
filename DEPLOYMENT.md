# Deployment Guide

## Issue: Inventory Management Shows 0 Values on Deployed Platforms

### Problem
The inventory management table shows 0 values on Vercel/Render but works correctly locally because:
1. Frontend uses relative URLs for API calls (works locally with proxy)
2. Deployed platforms need absolute URLs to your backend

### Solution

#### 1. Set Environment Variables

**For Vercel:**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variable:
   ```
   REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com
   ```

**For Render:**
1. Go to your Render dashboard
2. Navigate to your frontend service
3. Go to Environment → Environment Variables
4. Add the same variable as above

#### 2. Backend URL
Replace `https://your-backend-url.onrender.com` with your actual backend URL:
- If using Render for backend: `https://your-app-name.onrender.com`
- If using Railway: `https://your-app-name.railway.app`
- If using Heroku: `https://your-app-name.herokuapp.com`

#### 3. Database Connection
Ensure your backend has the correct MongoDB URI set in its environment variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

#### 4. CORS Configuration
Make sure your backend allows requests from your frontend domain. In `Backend/server.js`, the CORS configuration should include your frontend URL:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.vercel.app', 'http://localhost:3000']
}));
```

### Testing the Fix

1. **Deploy the updated code** with the API base URL changes
2. **Set the environment variable** in your deployment platform
3. **Test the inventory management** - it should now show the correct values

### Local Development

For local development, you can either:
1. **Use the proxy** (current setup) - works with `npm start`
2. **Set local environment variable**:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

### Troubleshooting

If the issue persists:
1. **Check browser console** for API errors
2. **Verify backend is running** and accessible
3. **Check CORS settings** in your backend
4. **Verify environment variables** are set correctly
5. **Check database connection** in backend logs

### Files Modified

The following files were updated to use the API base URL:
- `Frontend/src/Components/Inventory/InventoryPage.jsx`
- `Frontend/src/Components/FormPage/FormPage.jsx`

These changes ensure that API calls work both locally and on deployed platforms. 