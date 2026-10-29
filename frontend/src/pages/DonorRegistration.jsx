import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import styles from '../styles/profileStyles';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Field = ({ label, children, required }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}{required && <span style={{ color: '#D32F2F' }}> *</span>}</label>
    {children}
  </div>
);

const DonorRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    district: user?.district || '',
    state: user?.state || 'Karnataka',
    pincode: user?.pincode || '',
    lastDonationDate: '',
  });

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.gender)     return setError('Please select your gender.');
    if (!form.bloodGroup) return setError('Please select your blood group.');
    if (Number(form.age) < 18 || Number(form.age) > 65)
      return setError('Age must be between 18 and 65.');

    setLoading(true);
    try {
      await api.post('/donors/register', {
        ...form,
        age: Number(form.age),
        lastDonationDate: form.lastDonationDate || undefined,
      });
      navigate('/donor', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/donor')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <h1 style={styles.title}>Donor Registration</h1>
        <p style={styles.subtitle}>Complete your profile to get verified</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.errorBanner}>{error}</div>}

        {/* Personal Info */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Personal Information</div>

          <Field label="Full Name" required>
            <input name="name" value={form.name} onChange={handleChange}
              style={styles.input} required />
          </Field>

          <div style={styles.row}>
            <Field label="Age" required>
              <input name="age" type="number" min="18" max="65"
                value={form.age} onChange={handleChange}
                style={styles.input} required />
            </Field>

            <Field label="Gender" required>
              <select name="gender" value={form.gender} onChange={handleChange} style={styles.input} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>

          <Field label="Blood Group" required>
            <div style={styles.bloodGrid}>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg} type="button"
                  onClick={() => { setForm((f) => ({ ...f, bloodGroup: bg })); setError(''); }}
                  style={{
                    ...styles.bloodBtn,
                    ...(form.bloodGroup === bg ? styles.bloodBtnActive : {}),
                  }}
                >{bg}</button>
              ))}
            </div>
          </Field>
        </div>

        {/* Contact */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Contact Details</div>

          <Field label="Phone Number" required>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange}
              style={styles.input} required />
          </Field>

          <Field label="Email Address" required>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              style={styles.input} required />
          </Field>
        </div>

        {/* Address */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Address</div>

          <Field label="Street Address" required>
            <input name="address" value={form.address} onChange={handleChange}
              style={styles.input} required />
          </Field>

          <div style={styles.row}>
            <Field label="City / Taluk" required>
              <input name="city" value={form.city} onChange={handleChange}
                style={styles.input} required />
            </Field>

            <Field label="District" required>
              <select name="district" value={form.district} onChange={handleChange} style={styles.input} required>
                <option value="">-- Select District --</option>
                <option value="Hassan">Hassan</option>
                <option value="Bengaluru Urban">Bengaluru Urban</option>
                <option value="Bengaluru Rural">Bengaluru Rural</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Mandya">Mandya</option>
                <option value="Mangaluru">Mangaluru</option>
                <option value="Udupi">Udupi</option>
                <option value="Shivamogga">Shivamogga</option>
                <option value="Chikkamagaluru">Chikkamagaluru</option>
                <option value="Tumakuru">Tumakuru</option>
                <option value="Davanagere">Davanagere</option>
                <option value="Chitradurga">Chitradurga</option>
                <option value="Hubli-Dharwad">Hubli-Dharwad</option>
                <option value="Belagavi">Belagavi</option>
                <option value="Ballari">Ballari</option>
                <option value="Kalaburagi">Kalaburagi</option>
                <option value="Bidar">Bidar</option>
                <option value="Raichur">Raichur</option>
                <option value="Koppal">Koppal</option>
                <option value="Gadag">Gadag</option>
                <option value="Haveri">Haveri</option>
                <option value="Uttara Kannada">Uttara Kannada</option>
                <option value="Kodagu">Kodagu</option>
                <option value="Chamarajanagar">Chamarajanagar</option>
                <option value="Ramanagara">Ramanagara</option>
                <option value="Kolar">Kolar</option>
                <option value="Chikkaballapura">Chikkaballapura</option>
                <option value="Bagalkot">Bagalkot</option>
                <option value="Vijayapura">Vijayapura</option>
                <option value="Yadgir">Yadgir</option>
                <option value="Vijayanagara">Vijayanagara</option>
              </select>
            </Field>
          </div>

          <div style={styles.row}>
            <Field label="State" required>
              <input name="state" value={form.state} onChange={handleChange}
                style={styles.input} required />
            </Field>

            <Field label="Pincode" required>
              <input name="pincode" value={form.pincode} onChange={handleChange}
                style={styles.input} required maxLength={6} />
            </Field>
          </div>
        </div>

        {/* Donation history */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Donation History</div>
          <Field label="Last Donation Date (optional)">
            <input name="lastDonationDate" type="date" value={form.lastDonationDate}
              onChange={handleChange} style={styles.input}
              max={new Date().toISOString().split('T')[0]} />
          </Field>
          <p style={styles.hint}>Leave blank if you have never donated before.</p>
        </div>

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Submitting…' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
};

export default DonorRegistration;
