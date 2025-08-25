import React, { useState } from 'react';
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-register-container d-flex justify-content-center align-items-center">
      <div className="login-register-card shadow-lg p-4">
        <h1 className="dashboard-heading text-center mb-4">SALES ANALYSIS DASHBOARD</h1>
        <h2 className="text-center mb-4">Reset Password</h2>
        <form onSubmit={handlePasswordReset}>
          <div className="mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control animated-input"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100 animated-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : (
              'Send Reset Email'
            )}
          </button>
          {error && <p className="text-danger text-center mt-3">{error}</p>}
          {successMessage && <p className="text-success text-center mt-3">{successMessage}</p>}
        </form>
        <div className="toggle-link mt-3 w-100 text-center">
          <span onClick={() => navigate('/')} className="toggle-link-text" style={{cursor: 'pointer'}}>
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default PasswordResetRequestPage;
