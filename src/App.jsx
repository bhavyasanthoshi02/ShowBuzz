import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Logout from './pages/Logout';
import Booking from './pages/Booking';
import Bookings from './pages/Bookings';
import Movies from './pages/Movies';
import Sports from './pages/Sports';
import Music from './pages/Music';
import SportsBooking from './pages/SportsBooking';
import MusicBooking from './pages/MusicBooking';
import EventDetails from './pages/EventDetails';
import Favorites from './pages/Favorites';
import Rewards from './pages/Rewards';
import ProtectedRoute from './components/ProtectedRoute';
import AIConcierge from './components/AIConcierge';
import './index.css';
import './App.css';
import './styles/gamification.css';
import './styles/responsive.css';

function App() {
  return (
    <>
      <Routes>

      {/* 🔥 Default → Login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/logout" element={<Logout />} />

      {/* Protected */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movie/:title"
        element={
          <ProtectedRoute>
            <MovieDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book/:title"
        element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies"
        element={
          <ProtectedRoute>
            <Movies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sports"
        element={
          <ProtectedRoute>
            <Sports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/music"
        element={
          <ProtectedRoute>
            <Music />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-sport/:id"
        element={
          <ProtectedRoute>
            <SportsBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-music/:id"
        element={
          <ProtectedRoute>
            <MusicBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sports-detail/:id"
        element={
          <ProtectedRoute>
            <EventDetails type="sports" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/music-detail/:id"
        element={
          <ProtectedRoute>
            <EventDetails type="music" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rewards"
        element={
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
      <AIConcierge />
    </>
  );
}

export default App;