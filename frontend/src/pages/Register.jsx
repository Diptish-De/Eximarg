import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, WarningCircle } from '@phosphor-icons/react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useUser();
  const navigate = useNavigate();

  const handleValidation = () => {
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const valError = handleValidation();
    if (valError) {
      setErrorMsg(valError);
      return;
    }
    setSubmitting(true);
    const success = await register(email, password);
    setSubmitting(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center font-display font-extrabold text-xl text-white">
          E
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-white">EXIMARG</span>
      </div>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 shadow-2xl">
        <h2 className="font-display font-bold text-3xl text-white mb-2">Create Account</h2>
        <p className="text-brand-textMuted text-sm mb-6">Start your gamified export journey today</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-center gap-2 text-red-400 text-xs">
            <WarningCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-brand-border text-white text-sm focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="e.g. fresh@eximarg.com"
              data-testid="register-email-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-brand-border text-white text-sm focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Num"
              data-testid="register-password-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-brand-border text-white text-sm focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="Confirm password"
              data-testid="register-confirm-password-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            data-testid="register-submit-button"
          >
            {submitting ? 'Registering...' : 'Get Started'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-xs text-brand-textMuted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary font-bold hover:underline" data-testid="link-to-login">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
