import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './FormPage.css';

function FormPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        id: null,
        productName: '',
        time: '',
        price: '',
        quantity: '',
        netPrice: '',
        profit: 0,
        category: '',
        totalSales: 0,
        totalProfit: 0,
        location: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    const getCurrentTime = () => {
        return new Date().toISOString();
    };

    useEffect(() => {
        if (location.state && location.state.item) {
            const { item } = location.state;
            setFormData({ ...item, location: item.location || '' });
            setIsEditing(true);
        } else {
            setFormData((prevData) => ({
                ...prevData,
                time: getCurrentTime(),
                id: Date.now()
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => {
            let newValue = value;
            // Convert to number if the field is price, quantity, or netPrice
            if (["price", "quantity", "netPrice"].includes(name)) {
                newValue = value === '' ? '' : Number(value);
            }
            const updatedData = {
                ...prevData,
                [name]: newValue
            };

            // Always recalculate these values when any field changes
            if (updatedData.price && updatedData.netPrice && updatedData.quantity) {
                updatedData.profit = updatedData.price - updatedData.netPrice;
                updatedData.totalSales = updatedData.quantity * updatedData.price;
                updatedData.totalProfit = updatedData.quantity * updatedData.profit;
            }

            return updatedData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditing) {
            await updateData(formData);
        } else {
            await addData(formData);
        }

        navigate('/table-view');
    };

    const addData = async (formData) => {
        try {
            console.log('Sending data to backend:', formData);
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
            const response = await axios.post(`${API_BASE_URL}/api/products`, formData);
            if (response.status === 201) {
                const newProduct = response.data;
                console.log('Product added successfully:', newProduct);
                alert('Product added successfully!');
            } else {
                console.error('Failed to add product');
                alert('Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error.response?.data || error.message);
            alert('Error adding product: ' + (error.response?.data?.message || error.message));
        }
    };

    const updateData = async (formData) => {
        try {
            // Ensure all calculated fields are up to date
            const updatedFormData = {
                ...formData,
                profit: formData.price - formData.netPrice,
                totalSales: formData.quantity * formData.price,
                totalProfit: formData.quantity * (formData.price - formData.netPrice)
            };
            
            console.log('Updating product with data:', updatedFormData);
            console.log('Product ID:', updatedFormData._id);
            console.log('Location being updated to:', updatedFormData.location);
            
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
            const response = await axios.put(`${API_BASE_URL}/api/products/${updatedFormData._id}`, updatedFormData);
            if (response.status === 200) {
                const updatedProduct = response.data;
                console.log('Product updated successfully:', updatedProduct);
                console.log('Updated location in response:', updatedProduct.location);
                alert('Product updated successfully!');
            } else {
                console.error('Failed to update product');
                alert('Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error.response?.data || error.message);
            alert('Error updating product: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="form-outer-wrapper">
            <div className="form-container">
                <h2 className="form-title">{isEditing ? "Edit Product Data" : "Add Product Data"}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        className="form-input"
                        name="productName"
                        placeholder="Product Name"
                        onChange={handleChange}
                        value={formData.productName}
                        required
                    />
                    <div className="form-input" style={{ textAlign: 'left', color: '#555', background: '#f5f7fa', fontWeight: 500, marginBottom: '0.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
                        Date & Time: {formData.time ? new Date(formData.time).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                    <input
                        className="form-input"
                        name="price"
                        placeholder="Price"
                        onChange={handleChange}
                        value={formData.price}
                        required
                    />
                    <input
                        className="form-input"
                        name="quantity"
                        placeholder="Quantity"
                        onChange={handleChange}
                        value={formData.quantity}
                        required
                    />
                    <input
                        className="form-input"
                        name="netPrice"
                        placeholder="Net Price"
                        onChange={handleChange}
                        value={formData.netPrice}
                        required
                    />
                    <input
                        className="form-input"
                        name="profit"
                        value={formData.profit}
                        placeholder="Profit"
                        disabled
                    />
                    <input
                        className="form-input"
                        name="totalSales"
                        value={formData.totalSales}
                        placeholder="Total Sales"
                        disabled
                    />
                    <input
                        className="form-input"
                        name="totalProfit"
                        value={formData.totalProfit}
                        placeholder="Total Profit"
                        disabled
                    />
                    <input
                        className="form-input"
                        name="category"
                        placeholder="Category"
                        onChange={handleChange}
                        value={formData.category}
                        required
                    />
                    <select
                        className="form-input"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Country</option>
                        <option value="United States">United States</option>
                        <option value="India">India</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Japan">Japan</option>
                        <option value="Brazil">Brazil</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Russia">Russia</option>
                    </select>
                    <div className="form-buttons-row">
                        <button type="submit" className="form-button">
                            {isEditing ? "Update" : "Submit"}
                        </button>
                        <button
                            type="button"
                            className="form-button secondary"
                            onClick={() => navigate('/visualization', { state: { section: 'home' } })}
                        >
                            See Visualization
                        </button>
                        <button
                            type="button"
                            className="form-button third"
                            onClick={() => navigate('/table-view')}
                        >
                            View as Table
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FormPage;
