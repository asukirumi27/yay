import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import Layout from './components/Layout';

export default function App() {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!userId ? <Login setUserId={setUserId} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={userId ? <Layout setUserId={setUserId} /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard userId={userId!} />} />
          <Route path="add" element={<AddTransaction userId={userId!} />} />
          <Route path="transactions" element={<Transactions userId={userId!} />} />
        </Route>
      </Routes>
    </Router>
  );
}
