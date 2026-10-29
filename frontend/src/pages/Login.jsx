import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import styles from '../styles/authStyles';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleRoleRedirect = (user) => {
    if (from && from !== '/' && from !== '/login' && from !== '/register') {
      return navigate(from, { replace: true });
    }
    if (user.role === 'admin') return navigate('/admin', { replace: true });
    if (user.role === 'hospital') return navigate('/hospital', { replace: true });
    return navigate('/donor', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) {
      return setError('Please enter your email address.');
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      return setError('Please enter a valid email address (e.g. name@example.com).');
    }
    if (!form.password) {
      return setError('Please enter your password.');
    }

    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      handleRoleRedirect(user);
    } catch (err) {
      console.error('[Login error]', err);
      if (!err.response) {
        setError('Unable to connect to the RedFlow server. Please check your network connection and try again.');
      } else {
        setError(err.response?.data?.error || 'Invalid credentials or login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      handleRoleRedirect(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful or was cancelled.');
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo + Brand stacked */}
        <div style={styles.logoRow}>
          <img src={logo} alt="RedFlow Logo" style={styles.logoImg} />
          <div style={styles.brandText}>
            <span style={styles.red}>Red</span>
            <span style={styles.flow}>Flow</span>
          </div>
        </div>

        <h1 style={styles.title}>Sign in to your account</h1>
        <p style={styles.subtitle}>Enter your credentials to continue</p>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={styles.dividerContainer}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine} />
        </div>

        <div style={styles.googleBtnContainer}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="100%"
            text="signin_with"
            shape="rectangular"
          />
        </div>

        <p style={styles.switchText}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={styles.switchLink}>Register as donor</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
