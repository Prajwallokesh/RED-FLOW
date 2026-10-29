import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home             from './pages/Home';
import Login            from './pages/Login';
import Register         from './pages/Register';
import DonorDashboard   from './pages/DonorDashboard';
import DonorRegistration from './pages/DonorRegistration';
import DonorProfile     from './pages/DonorProfile';
import AdminDashboard   from './pages/AdminDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import VerifyUnit        from './pages/VerifyUnit';
import BlockchainHub     from './pages/BlockchainHub';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public & Blockchain */}
          <Route path="/"                       element={<Home />} />
          <Route path="/login"                  element={<Login />} />
          <Route path="/register"               element={<Register />} />
          <Route path="/verify/:unitId"         element={<VerifyUnit />} />
          <Route path="/blockchain"             element={<BlockchainHub />} />
          <Route path="/blockchain/history"     element={<BlockchainHub />} />
          <Route path="/blockchain/immutability" element={<BlockchainHub />} />

          {/* Donor */}
          <Route path="/donor" element={
            <ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>
          } />
          <Route path="/donor/register" element={
            <ProtectedRoute roles={['donor']}><DonorRegistration /></ProtectedRoute>
          } />
          <Route path="/donor/profile" element={
            <ProtectedRoute roles={['donor']}><DonorProfile /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/blockchain" element={
            <ProtectedRoute roles={['admin']}><BlockchainHub /></ProtectedRoute>
          } />

          {/* Hospital */}
          <Route path="/hospital" element={
            <ProtectedRoute roles={['hospital']}><HospitalDashboard /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
