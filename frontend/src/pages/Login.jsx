import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from '@phosphor-icons/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  const autofill = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
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
        <h2 className="font-display font-bold text-3xl text-white mb-2">Welcome Back</h2>
        <p className="text-brand-textMuted text-sm mb-6">Enter details to manage your global export business</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-brand-border text-white text-sm focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="e.g. fresh@eximarg.com"
              data-testid="login-email-input"
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
              placeholder="••••••••"
              data-testid="login-password-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            data-testid="login-submit-button"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-xs text-brand-textMuted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-primary font-bold hover:underline" data-testid="link-to-register">
            Create Account
          </Link>
        </p>

        {/* Test credentials helper */}
        <div className="mt-8 pt-6 border-t border-brand-border">
          <div className="flex items-center gap-2 text-brand-accent text-xs font-bold mb-3">
            <ShieldCheck size={16} />
            <span>MOCK TEST ACCOUNTS</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => autofill('fresh@eximarg.com', 'Fresh@123')}
              className="px-2 py-2 bg-brand-border/20 border border-brand-border hover:bg-brand-border/40 text-[10px] rounded-lg text-white font-medium"
              data-testid="autofill-fresh-button"
            >
              Fresh
            </button>
            <button
              onClick={() => autofill('admin@eximarg.com', 'Admin@123')}
              className="px-2 py-2 bg-brand-border/20 border border-brand-border hover:bg-brand-border/40 text-[10px] rounded-lg text-white font-medium"
              data-testid="autofill-admin-button"
            >
              Admin
            </button>
            <button
              onClick={() => autofill('provider@eximarg.com', 'Provider@123')}
              className="px-2 py-2 bg-brand-border/20 border border-brand-border hover:bg-brand-border/40 text-[10px] rounded-lg text-white font-medium"
              data-testid="autofill-provider-button"
            >
              Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
