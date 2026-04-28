import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import {
    auth,
    signInWithEmailAndPassword,
    signInWithPopup,
    googleProvider
} from '../firebase';
import Slideshow from '../components/Slideshow';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // 🔐 Email login
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/home');

        } catch (err) {
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    // 🔐 Google login
    const handleGoogleSignIn = async () => {
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);

            // ✅ FIX: go to /home
            navigate('/home');

        } catch (err) {
            setError('Google sign-in failed.');
        }
    };



    return (
        <div className="auth-page">

            {/* LEFT */}
            <div className="auth-left">
                <Slideshow />
                <div className="auth-content">
                    <div className="badge">Now Showing</div>
                    <h1>Welcome Back to <span>ShowBuzz.</span></h1>
                    <p>
                        Log in to access your bookings, exclusive premieres,
                        and personalized movie recommendations.
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="auth-right">
                <div className="logo-container">
                    <div className="logo-text">SHOWBUZZ</div>
                </div>

                <h2 className="auth-title">Log In</h2>
                <p className="auth-subtitle">Continue your cinematic journey.</p>

                {error && (
                    <div className="error-message" style={{ marginBottom: '20px' }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">
                            <Mail /> Email Address
                        </label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock /> Password
                        </label>

                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                {/* Divider */}
                <div className="divider">
                    <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                    <span>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                </div>

                {/* Google */}
                <button className="social-button" onClick={handleGoogleSignIn}>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        width="20"
                        alt="google"
                    />
                    Continue with Google
                </button>

                <div className="auth-link-container">
                    New to ShowBuzz? <Link to="/signup">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;