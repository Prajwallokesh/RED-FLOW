import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import styles from '../styles/authStyles';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (form.name.trim().length < 2) return 'Full name must be at least 2 characters.';

    if (!form.email.trim()) return 'Email address is required.';
    if (!EMAIL_REGEX.test(form.email.trim())) {
      return 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!form.phone.trim()) return 'Mobile number is required.';
    const cleanPhone = form.phone.trim().replace(/[\s-]/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      return 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }

    if (!form.password) return 'Password is required.';
    if (!isPasswordValid) {
      return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password, form.phone.trim());
      navigate('/donor', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      if (user.role === 'admin') return navigate('/admin', { replace: true });
      if (user.role === 'hospital') return navigate('/hospital', { replace: true });
      return navigate('/donor', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Google Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Registration was unsuccessful or was cancelled.');
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

        <h1 style={styles.title}>Create a donor account</h1>
        <p style={styles.subtitle}>Join the RedFlow blood supply network</p>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text" autoComplete="name" required
              value={form.name} onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              value={form.email} onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="phone">Mobile Number</label>
            <input
              id="phone" name="phone" type="tel" autoComplete="tel" required
              value={form.phone} onChange={handleChange}
              style={styles.input}
              maxLength={13}
            />
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              10-digit Indian mobile number
            </span>
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password" autoComplete="new-password" required
              value={form.password} onChange={handleChange}
              style={styles.input}
            />
            {form.password && (
              <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
                <span style={{ color: passwordChecks.length ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                  {passwordChecks.length ? 'At least 8 characters' : 'At least 8 characters required'}
                </span>
                <span style={{ color: (passwordChecks.uppercase && passwordChecks.lowercase) ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                  {(passwordChecks.uppercase && passwordChecks.lowercase) ? 'Uppercase & lowercase letters' : 'Uppercase & lowercase letters required'}
                </span>
                <span style={{ color: passwordChecks.number ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                  {passwordChecks.number ? 'At least one number (0-9)' : 'At least one number required'}
                </span>
                <span style={{ color: passwordChecks.special ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                  {passwordChecks.special ? 'At least one special character (!@#$%...)' : 'At least one special character required'}
                </span>
              </div>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm" name="confirm" type="password" autoComplete="new-password" required
              value={form.confirm} onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: form.confirm && form.password !== form.confirm ? '#DC2626' : '#E0E0E0'
              }}
            />
            {form.confirm && form.password !== form.confirm && (
              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                Passwords do not match
              </span>
            )}
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Creating account…' : 'Create Account'}
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
            text="signup_with"
            shape="rectangular"
          />
        </div>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
