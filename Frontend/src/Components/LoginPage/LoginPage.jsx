import React, { useState } from 'react';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration successful!");
      navigate('/');
    } catch (err) {
      console.log(err.code, err.message); 
      if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use. Try logging in.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to register. Please try again.");
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password); 
      navigate('/visualization', { state: { section: 'home' } });
    } catch (err) {
      setError("Failed to log in. Check your credentials.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Check your inbox.");
      setError(null);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
      setSuccessMessage(null);
    }
  };

  const resetForm = () => {
    setIsRegistering(false);
    setIsPasswordReset(false);
    setError(null);
    setSuccessMessage(null);
  };

  if (isPasswordReset) {
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
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 animated-button">
              Send Reset Email
            </button>
            {error && <p className="text-danger text-center mt-3">{error}</p>}
            {successMessage && <p className="text-success text-center mt-3">{successMessage}</p>}
          </form>
          <div className="toggle-link mt-3 w-100 text-center">
            <span onClick={resetForm} className="toggle-link-text" style={{cursor: 'pointer'}}>
              Back to Login
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-register-container d-flex justify-content-center align-items-center">
      <div className="login-register-card shadow-lg p-4">
        <h1 className="dashboard-heading text-center mb-4">SALES ANALYSIS DASHBOARD</h1>
        <h2 className="text-center mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control animated-input"
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control animated-input"
              placeholder="Password"
              required
            />
          </div>
         
          <button type="submit" className="btn btn-primary w-100 animated-button">
            {isRegistering ? 'Register' : 'Login'}
          </button>
          {error && <p className="text-danger text-center mt-3">{error}</p>}
        </form>
        <div className="toggle-link mt-3 w-100 text-center">
          <span onClick={() => setIsRegistering(!isRegistering)} className="toggle-link-text" style={{cursor: 'pointer'}}>
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </span>
        </div>
        {!isRegistering && (
          <div className="toggle-link mt-2 w-100 text-center">
            <span onClick={() => setIsPasswordReset(true)} className="toggle-link-text" style={{cursor: 'pointer'}}>
              Forgot Password?
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginRegister;
