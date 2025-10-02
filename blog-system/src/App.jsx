import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

// Componentes
import Navbar from './components/Navbar';
import BlogPage from './components/BlogPage';
import InstagramPage from './components/InstagramPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import PostEditor from './components/PostEditor';
import CommentsManager from './components/CommentsManager';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<BlogPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/instagram" element={<InstagramPage />} />
          
          {/* Rotas de admin */}
          <Route 
            path="/admin/login" 
            element={isAuthenticated ? <Navigate to="/admin" /> : <AdminLogin />} 
          />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/posts/new" element={
            <ProtectedRoute>
              <PostEditor />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/posts/edit/:id" element={
            <ProtectedRoute>
              <PostEditor />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/comments" element={
            <ProtectedRoute>
              <CommentsManager />
            </ProtectedRoute>
          } />
          
          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
