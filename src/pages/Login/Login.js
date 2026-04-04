import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { authAPI } from '../../services/api';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.login(formData.email, formData.password);
      // Backend returns: { token: "...", message: "Login successful" }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ email: formData.email }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const data = await authAPI.googleLogin(credentialResponse.credential);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ email: data.email || 'Google User' }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was unsuccessful. Please try again.');
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-bg">
        <div className="auth-bg-shape auth-bg-shape-1"></div>
        <div className="auth-bg-shape auth-bg-shape-2"></div>
        <div className="auth-bg-shape auth-bg-shape-3"></div>
      </div>

      <div className="auth-card" id="login-card">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="auth-brand-icon">Q</span>
            <span className="auth-brand-text">Quanment</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="auth-error" id="login-error">
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="google-login-wrapper" id="google-login-btn">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="360"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>

        <div className="auth-divider">
          <span className="auth-divider-line"></span>
          <span className="auth-divider-text">or sign in with email</span>
          <span className="auth-divider-line"></span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="login-email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                id="toggle-password"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`auth-submit ${loading ? 'auth-submit--loading' : ''}`}
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link" id="goto-signup">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
