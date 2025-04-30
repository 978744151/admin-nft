import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AdminLayout from './layouts/AdminLayout.jsx';
import LoginPage from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NFTList from './pages/NFT/NFTList.jsx';
import NFTCreate from './pages/NFT/NFTCreate.jsx';
import NFTEdit from './pages/NFT/NFTEdit.jsx';
import CommentList from './pages/Comments/CommentList.jsx';
import NotFound from './pages/NotFound.jsx';
import NFTMarketplace from './pages/NFT/NFTMarketplace.jsx';

import './App.css';

// Authentication guard
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="nfts" element={<NFTList />} />
          <Route path="nfts/create" element={<NFTCreate />} />
          <Route path="nfts/edit/:id" element={<NFTEdit />} />
          <Route path="comments" element={<CommentList />} />
          <Route path="*" element={<NotFound />} />
          <Route path="nfts/marketplace" element={<NFTMarketplace />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App; 