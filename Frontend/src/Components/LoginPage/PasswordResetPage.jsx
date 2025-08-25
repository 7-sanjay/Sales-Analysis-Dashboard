import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './LoginPage.css';

function PasswordResetPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setError('Invalid password reset link.');
      setIsLoading(false);
      return;
    }

    // Verify the password reset code
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setIsValidLink(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error verifying reset code:', error);
        setError('This password reset link is invalid or has expired.');
        setIsLoading(false);
      });
  }, [searchParams]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const oobCode = searchParams.get('oobCode');
    
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setError(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      if (error.code === 'auth/expired-action-code') {
        setError('This password reset link has expired. Please request a new one.');
      } else if (error.code === 'auth/invalid-action-code') {
        setError('Invalid password reset link.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="login-register-container d-flex justify-content-center align-items-center">
        <div className="login-register-card shadow-lg p-4">
          <h1 className="dashboard-heading text-center mb-4">SALES ANALYSIS DASHBOARD</h1>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="login-register-container d-flex justify-content-center align-items-center">
        <div className="login-register-card shadow-lg p-4">
          <h1 className="dashboard-heading text-center mb-4">SALES ANALYSIS DASHBOARD</h1>
          <h2 className="text-center mb-4">Password Reset Successful!</h2>
          <div className="text-center">
            <div className="text-success mb-3">
              <i className="fas fa-check-circle" style={{ fontSize: '3rem' }}></i>
            </div>
            <p>Your password has been successfully reset.</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-primary animated-button"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidLink) {
    return (
      <div className="login-register-container d-flex justify-content-center align-items-center">
        <div className="login-register-card shadow-lg p-4">
          <h1 className="dashboard-heading text-center mb-4">SALES ANALYSIS DASHBOARD</h1>
          <h2 className="text-center mb-4">Invalid Reset Link</h2>
          <div className="text-center">
            <div className="text-danger mb-3">
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem' }}></i>
            </div>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-primary animated-button"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-register-container d-flex justify-content-center align-items-center">
      <div className="login-register-card shadow-lg p-4">
        <h1 className="dashboard-heading text-center mb-4">SALES ANALYSIS DASHBOARD</h1>
        <h2 className="text-center mb-4">Set New Password</h2>
        <form onSubmit={handlePasswordReset}>
          <div className="mb-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-control animated-input"
              placeholder="New Password"
              required
              minLength="6"
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control animated-input"
              placeholder="Confirm New Password"
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 animated-button">
            Reset Password
          </button>
          {error && <p className="text-danger text-center mt-3">{error}</p>}
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

export default PasswordResetPage;
