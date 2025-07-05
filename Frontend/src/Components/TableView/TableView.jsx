import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import axios from 'axios';
import './TableView.css';

function TableView() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const deleteAllData = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/products`);
      setData([]);
      alert(response.data.message);
    } catch (error) {
      console.error('Error deleting all data:', error.response?.data || error.message);
      alert('Failed to delete all data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="table-container">
      {/* <h1>Wait for 30-40 seconds to see the data</h1> */}
      <h2>Sales Data</h2>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <CSVLink data={data} filename="sales-data.csv" className="btn btn-custom">
          Download as Excel
        </CSVLink>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/visualization', { state: { data } })}
        >
          View Visualizations
        </button>
        <button className="btn btn-home" onClick={() => navigate('/form')}>
          Add Product
        </button>
        <button className="btn btn-danger" onClick={deleteAllData}>
          Delete All
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Time</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Net Price</th>
            <th>Profit</th>
            <th>Total Sales</th>
            <th>Total Profit</th>
            <th>Category</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.productName}</td>
              <td>{(() => { const d = new Date(item.time); return isNaN(d) ? 'N/A' : d.toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); })()}</td>
              <td>{item.price}</td>
              <td>{item.quantity}</td>
              <td>{item.netPrice}</td>
              <td>{item.price - item.netPrice}</td>
              <td>{item.price * item.quantity}</td>
              <td>{(item.price - item.netPrice) * item.quantity}</td>
              <td>{item.category}</td>
              <td>{item.location}</td>
              <td>
                <button
                  className="btn btn-edit"
                  onClick={() => navigate('/form', { state: { item } })}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableView;
