import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreAuthFromCookie } from './redux/slices/authSlice';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

function App() {
  const dispatch = useDispatch();
  const authRestored = useSelector((state) => state.auth.authRestored);

  // Check if user is already authenticated via cookie on app load
  useEffect(() => {
    dispatch(restoreAuthFromCookie());
  }, [dispatch]);

  // Show nothing until auth check is complete to prevent flashing login page
  if (!authRestored) {
    return (
      <div className="bg-gray-900 text-white min-h-screen font-sans flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;