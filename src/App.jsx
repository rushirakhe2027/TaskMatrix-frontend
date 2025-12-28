import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from './components/layout/MainLayout';
import Board from './components/board/Board';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import { fetchProjects } from './redux/slices/projectSlice';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchProjects());
    }
  }, [user, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Landing />} />
      <Route path="/signup" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />

      <Route
        path="/"
        element={
          user ? (
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          ) : (
            <Landing />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<Board />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
