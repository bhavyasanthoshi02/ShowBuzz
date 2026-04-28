import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import {
    auth,
    createUserWithEmailAndPassword,
    signInWithPopup,
    googleProvider
} from '../firebase';
import Slideshow from '../components/Slideshow';

const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // 🆕 Signup
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createUserWithEmailAndPassword(auth, email, password);

            // ✅ FIX: redirect to home
            navigate('/home');

        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use.');
            } else {
                setError('Failed to create account.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Google signup
    const handleGoogleSignIn = async () => {
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);

            // ✅ FIX
            navigate('/home');

        } catch {
            setError('Google sign-in failed.');
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-left">
                <Slideshow />
                <div className="auth-content">
                    <div className="badge">The Digital Premiere</div>
                    <h1>Step Into the <span>Spotlight.</span></h1>
                    <p>
                        Experience cinema like never before. Exclusive access to
                        premieres and curated recommendations.
                    </p>
                </div>
            </div>

            <div className="auth-right">
                <div className="logo-container">
                    <div className="logo-text">SHOWBUZZ</div>
                </div>

                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join our movie community.</p>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp}>
                    <div className="form-group">
                        <label className="form-label"><User /> Full Name</label>
                        <input
                            className="input-field"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Mail /> Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Lock /> Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field"
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

                    <button className="submit-btn" disabled={loading}>
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>

                <div className="divider">
                    <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                    <span>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                </div>

                <button className="social-button" onClick={handleGoogleSignIn}>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        width="20"
                        alt="google"
                    />
                    Continue with Google
                </button>

                <div className="auth-link-container">
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;