import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import axios from 'axios';
import './TableView.css';

function TableView() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [API_BASE_URL]);

  const deleteAllData = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/products`);
      setData([]);
      setSelectedRows(new Set());
      alert(response.data.message);
    } catch (error) {
      console.error('Error deleting all data:', error.response?.data || error.message);
      alert('Failed to delete all data');
    }
  };

  const handleRowSelect = (index) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(index)) {
      newSelectedRows.delete(index);
    } else {
      newSelectedRows.add(index);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, index) => index)));
    }
  };

  const deleteSelectedRows = async () => {
    if (selectedRows.size === 0) {
      alert('Please select at least one row to delete.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedRows.size} selected row(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const selectedIds = Array.from(selectedRows).map(index => data[index]._id);
      
      // Delete each selected row
      const deletePromises = selectedIds.map(id => 
        axios.delete(`${API_BASE_URL}/api/products/${id}`)
      );
      
      await Promise.all(deletePromises);
      
      // Update the data by removing deleted rows
      const newData = data.filter((_, index) => !selectedRows.has(index));
      setData(newData);
      setSelectedRows(new Set());
      
      alert(`Successfully deleted ${selectedIds.length} row(s).`);
    } catch (error) {
      console.error('Error deleting selected rows:', error.response?.data || error.message);
      alert('Failed to delete selected rows');
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          onClick={() => navigate('/visualization', { state: { data, fromHomeNav: true } })}
        >
          View Visualizations
        </button>
        <button className="btn btn-home" onClick={() => navigate('/form')}>
          Add Product
        </button>
        <button className="btn btn-inventory" onClick={() => navigate('/inventory')}>
          Inventory Management
        </button>
        <button className="btn btn-login" onClick={() => navigate('/')}>Home/Login</button>
        {selectedRows.size > 0 && (
          <button className="btn btn-warning" onClick={deleteSelectedRows}>
            Delete Selected ({selectedRows.size})
          </button>
        )}
        <button className="btn btn-danger" onClick={async () => {
          if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
            await deleteAllData();
          }
        }}>
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
            <th>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🗑️</span>
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedRows.size === data.length}
                  onChange={handleSelectAll}
                  style={{ transform: 'scale(1.2)' }}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={selectedRows.has(index) ? 'selected-row' : ''}>
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
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.has(index)}
                  onChange={() => handleRowSelect(index)}
                  style={{ transform: 'scale(1.2)' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableView;
