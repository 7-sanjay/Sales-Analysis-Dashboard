# 📊 Sales Analysis Dashboard

A comprehensive full-stack MERN (MongoDB, Express, React, Node.js) application for tracking and analyzing sales data with beautiful data visualization using **Chart.js**, **ApexCharts**, and **Recharts**, plus AI-powered insights from **Google Gemini AI** and **Firebase Authentication**.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## 🚀 Features

### 🔐 **Authentication & Security**
- **Firebase Authentication**: Secure user login and password reset functionality
- **Protected Routes**: Route-based access control for authenticated users
- **Password Reset**: Email-based password recovery system
- **Session Management**: Secure user session handling

### 📊 **Data Management**
- **Product Management**: Add, edit, and track product sales data with comprehensive form validation
- **CSV Import**: Bulk import products from CSV files with drag-and-drop functionality
- **Inventory Management**: Real-time inventory tracking with stock level monitoring and email alerts
- **Data Visualization**: Interactive charts and graphs for sales analysis using multiple chart libraries

### 🎯 **User Interface**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with gradient designs and smooth animations
- **Side-by-Side Layout**: Form and CSV upload on the same page for efficient workflow
- **Table View**: Comprehensive data table with sorting, filtering, and bulk operations
- **Multiple Chart Libraries**: Chart.js, ApexCharts, and Recharts for diverse visualization needs

### 🔧 **Advanced Functionality**
- **Row Selection**: Select individual or multiple rows for bulk operations
- **Bulk Delete**: Delete selected rows with confirmation dialogs
- **Real-time Updates**: Instant data synchronization across all views
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Email Notifications**: Automated low stock and out-of-stock alerts

### 📈 **Analytics & Insights**
- **Interactive Charts**: Dynamic visualizations using Chart.js, ApexCharts, and Recharts
- **AI-Powered Insights**: Smart business insights using Google Gemini AI
- **Comprehensive Analytics**: Detailed analytics endpoint with category, location, and time analysis
- **Sales Analytics**: Track sales, profit, and inventory trends
- **Export Functionality**: Download data as CSV files
- **Statistical Analysis**: Price ranges, profit margins, and performance metrics

### 🛡️ **Security & Performance**
- **Cloud Database**: Secure data storage with MongoDB Atlas
- **RESTful API**: Well-structured backend API with Express.js
- **Input Validation**: Comprehensive form validation and data sanitization
- **Optimized Performance**: Efficient data handling and rendering
- **Email Service**: SMTP-based email notifications for inventory alerts

---

## 🖼️ Project Architecture

```mermaid
flowchart TD
  A[User Interface] -->|Authentication| B[Firebase Auth]
  A -->|Data Entry| C[React Frontend]
  C -->|API Calls| D[Express.js Backend]
  D -->|Data Storage| E[MongoDB Atlas]
  C -->|Visualization| F[Chart.js/ApexCharts/Recharts]
  C -->|AI Insights| G[Gemini AI]
  G -->|Smart Analysis| C
  D -->|Email Alerts| H[SMTP Service]
  
  subgraph "Frontend Features"
    C1[Login/Auth]
    C2[Product Form]
    C3[CSV Upload]
    C4[Table View]
    C5[Inventory Management]
    C6[Data Visualization]
    C7[Password Reset]
  end
  
  subgraph "Backend Services"
    D1[Product API]
    D2[Inventory API]
    D3[Analytics API]
    D4[CSV Processing]
    D5[Email Service]
    D6[Gemini Integration]
  end
  
  C --> C1
  C --> C2
  C --> C3
  C --> C4
  C --> C5
  C --> C6
  C --> C7
  
  D --> D1
  D --> D2
  D --> D3
  D --> D4
  D --> D5
  D --> D6
  
  style G fill:#f9f,stroke:#333,stroke-width:2px
  style F fill:#ffb,stroke:#333,stroke-width:2px
  style E fill:#bfb,stroke:#333,stroke-width:2px
  style D fill:#bbf,stroke:#333,stroke-width:2px
  style C fill:#fff,stroke:#333,stroke-width:2px
  style B fill:#ffa,stroke:#333,stroke-width:2px
  style A fill:#eee,stroke:#333,stroke-width:2px
```

---

## 🛠️ Local Development Setup

> **Prerequisites**: [Node.js](https://nodejs.org/) and [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### 1. Clone the Repository

```bash
git clone https://github.com/7-sanjay/Sales-Analysis-Dashboard.git
cd Sales-Analysis-Dashboard
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_SECURE=false
ALERT_EMAIL_FROM=your_email@domain.com
ALERT_EMAIL_TO=admin@domain.com
LOW_STOCK_THRESHOLD=3
LOW_STOCK_ALERT_COOLDOWN_MS=21600000
OUT_OF_STOCK_ALERT_COOLDOWN_MS=86400000
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the Frontend directory:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 4. Run the Application

**Start Backend Server:**
```bash
cd Backend
npm start
```

**Start Frontend Development Server:**
```bash
cd Frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 📁 Project Structure

```
Sales-Analysis-Dashboard/
├── Backend/
│   ├── models/
│   │   ├── Product.js          # Product data model
│   │   └── Inventory.js        # Inventory data model
│   ├── services/
│   │   └── emailService.js     # Email notification service
│   ├── uploads/                # Temporary CSV file storage
│   ├── server.js               # Main server file with all API routes
│   ├── sample_products.csv     # Sample data for testing
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── FormPage/           # Product form and CSV upload
│   │   │   ├── TableView/          # Data table with bulk operations
│   │   │   ├── Inventory/          # Inventory management
│   │   │   ├── InventoryVisualization/  # Inventory charts
│   │   │   ├── LoginPage/          # Authentication components
│   │   │   └── Visualization/      # Sales charts and analytics
│   │   ├── services/
│   │   │   └── openaiService.js   # AI service integration
│   │   ├── firebase.js            # Firebase configuration
│   │   ├── App.jsx                # Main app component
│   │   └── index.js
│   ├── build/                     # Production build
│   ├── public/                    # Static assets
│   └── package.json
├── DEPLOYMENT.md                  # Deployment guide
└── README.md
```

---

## 🎯 Key Features Explained

### 📝 **Product Management**
- **Add Products**: Comprehensive form with category selection, product details, and automatic calculations
- **Edit Products**: Update existing product information with real-time inventory adjustments
- **Bulk Import**: Upload multiple products via CSV files with validation and error reporting

### 📊 **Table View**
- **Responsive Table**: All columns fit within screen width without horizontal scrolling
- **Row Selection**: Checkbox-based selection for individual or bulk operations
- **Bulk Delete**: Delete multiple selected rows with confirmation
- **Export Data**: Download table data as CSV files

### 📦 **Inventory Management**
- **Stock Tracking**: Real-time inventory monitoring with visual indicators
- **Category Filtering**: Filter products by category for easy management
- **Stock Updates**: Edit product prices, net prices, and stock quantities
- **Low Stock Alerts**: Visual indicators for products with low inventory

### 📈 **Data Visualization**
- **Interactive Charts**: Dynamic graphs showing sales trends and analytics
- **AI Insights**: Smart analysis and recommendations using Gemini AI
- **Real-time Updates**: Charts update automatically when data changes

---

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete single product
- `DELETE /api/products` - Delete all products
- `POST /api/upload-csv` - Upload and process CSV file

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Add/update inventory item
- `POST /api/inventory/reduce` - Reduce stock quantity

### Analytics
- `GET /api/analytics` - Get comprehensive analytics data
- `POST /api/generate-insight` - Generate AI insights for charts

---

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com`
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `PORT` - Server port (usually 5000)
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
   - `ALERT_EMAIL_FROM`, `ALERT_EMAIL_TO` - Email addresses for alerts
3. Deploy and get your backend URL
4. Update frontend environment variables with backend URL

### Important Notes
- See `DEPLOYMENT.md` for detailed deployment instructions
- Ensure CORS is configured to allow your frontend domain
- Test email functionality after deployment

---

## 🛡️ Security Features

- **Firebase Authentication**: Secure user authentication and session management
- **Input Validation**: All user inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **File Upload Security**: Secure CSV file processing with validation
- **Database Security**: MongoDB Atlas with secure connection strings
- **Email Security**: SMTP-based email notifications with configurable settings
- **API Security**: CORS configuration and request validation

---

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with side-by-side layouts
- **Tablet**: Adapted layouts with touch-friendly interfaces
- **Mobile**: Stacked layouts with optimized touch interactions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sanjay** - [GitHub](https://github.com/7-sanjay)

---

## 🙏 Acknowledgments

- [Chart.js](https://www.chartjs.org/) for beautiful data visualizations
- [ApexCharts](https://apexcharts.com/) for advanced chart components
- [Recharts](https://recharts.org/) for React-based charting
- [Google Gemini AI](https://ai.google.dev/) for intelligent insights
- [Firebase](https://firebase.google.com/) for authentication services
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud database
- [React](https://reactjs.org/) and [Express.js](https://expressjs.com/) communities