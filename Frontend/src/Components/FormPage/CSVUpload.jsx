import React, { useState } from 'react';
import axios from 'axios';
import './CSVUpload.css';

const CSVUpload = ({ onUploadSuccess, onUploadError }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setUploadResult(null);
        } else if (selectedFile) {
            alert('Please select a valid CSV file');
            setFile(null);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'text/csv') {
            setFile(droppedFile);
            setUploadResult(null);
        } else if (droppedFile) {
            alert('Please drop a valid CSV file');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a CSV file first');
            return;
        }

        setUploading(true);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('csvFile', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/upload-csv`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = response.data;
            setUploadResult(result);
            
            if (result.success.count > 0) {
                if (onUploadSuccess) {
                    onUploadSuccess(result);
                }
            }
            
            if (result.errors.count > 0) {
                if (onUploadError) {
                    onUploadError(result.errors);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || 'Upload failed';
            setUploadResult({
                success: { count: 0, message: 'Upload failed' },
                errors: { count: 1, details: [{ error: errorMessage }] }
            });
            
            if (onUploadError) {
                onUploadError({ count: 1, details: [{ error: errorMessage }] });
            }
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            'id,productName,time,price,quantity,netPrice,profit,category,totalSales,totalProfit,location,createdAt,inventory',
            '1752339336557,Xbox Series X,2025-06-29T03:55:36.557+00:00,52999,2,46370,6629,Gaming Consoles,105998,13258,India,2025-07-12T16:56:30.455+00:00,[]',
            '1752339336558,PlayStation 5,2025-06-29T04:00:00.000+00:00,49999,1,43750,6249,Gaming Consoles,49999,6249,India,2025-07-12T16:57:00.000+00:00,[]'
        ].join('\n');
        
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const clearResult = () => {
        setUploadResult(null);
        setFile(null);
    };

    return (
        <div className="csv-upload-container">
            <h3>Import Products from CSV</h3>
            
            <div className="upload-section">
                <div 
                    className={`drag-drop-area ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="drag-content">
                        <i className="upload-icon">📁</i>
                        <p>Drag and drop your CSV file here, or click to browse</p>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="file-input"
                            id="csv-file-input"
                        />
                        <label htmlFor="csv-file-input" className="browse-button">
                            Browse Files
                        </label>
                    </div>
                </div>

                {file && (
                    <div className="file-info">
                        <span>Selected file: {file.name}</span>
                        <button onClick={() => setFile(null)} className="remove-file">
                            ✕
                        </button>
                    </div>
                )}

                <div className="upload-actions">
                    <button 
                        onClick={handleUpload} 
                        disabled={!file || uploading}
                        className="upload-button"
                    >
                        {uploading ? 'Uploading...' : 'Upload CSV'}
                    </button>
                    
                    <button onClick={downloadTemplate} className="template-button">
                        Download Template
                    </button>
                </div>
            </div>

            {uploadResult && (
                <div className="upload-result">
                    <div className="result-header">
                        <h4>Upload Results</h4>
                        <button onClick={clearResult} className="clear-result">✕</button>
                    </div>
                    
                    <div className="result-summary">
                        <div className="success-summary">
                            <span className="success-count">{uploadResult.success.count}</span>
                            <span className="success-label">Products imported successfully</span>
                        </div>
                        
                        {uploadResult.errors.count > 0 && (
                            <div className="error-summary">
                                <span className="error-count">{uploadResult.errors.count}</span>
                                <span className="error-label">Errors encountered</span>
                            </div>
                        )}
                    </div>

                    {uploadResult.errors.count > 0 && (
                        <div className="error-details">
                            <h5>Error Details:</h5>
                            <div className="error-list">
                                {uploadResult.errors.details.map((error, index) => (
                                    <div key={index} className="error-item">
                                        <strong>Row {error.row}:</strong> {error.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="result-message">
                        {uploadResult.success.count > 0 && (
                            <p className="success-message">{uploadResult.success.message}</p>
                        )}
                        {uploadResult.errors.count > 0 && (
                            <p className="error-message">
                                {uploadResult.errors.count} rows had errors and were not imported.
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="csv-requirements">
                <h4>CSV Requirements:</h4>
                <ul>
                    <li>File must be in CSV format (.csv extension)</li>
                    <li>Required columns: productName, category, location</li>
                    <li>Optional columns: id, time, price, quantity, netPrice, profit, totalSales, totalProfit, createdAt, inventory</li>
                    <li>Date fields should be in ISO 8601 format (e.g., 2025-06-29T03:55:36.557+00:00)</li>
                    <li>Numeric fields should contain only numbers</li>
                    <li>Inventory field should be a valid JSON array (e.g., [])</li>
                </ul>
            </div>
        </div>
    );
};

export default CSVUpload;
