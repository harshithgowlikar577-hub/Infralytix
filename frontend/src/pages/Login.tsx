import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Eye, EyeOff, ArrowRight, Shield, Lock } from 'lucide-react';
import infralytixLogo from '../assets/logo.png';


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030B16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[40%] right-[20%] w-[250px] h-[250px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative w-full max-w-[440px]">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl mx-auto" />
            <img
              src={infralytixLogo}
              alt="INFRALYTIX Official Emblem"
              className="w-24 h-24 object-contain drop-shadow-2xl relative z-10 transition-transform hover:scale-105 duration-300"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wider">INFRALYTIX</h1>
          <p className="text-sm text-slate-400 mt-1.5 tracking-wide">National Infrastructure Intelligence Platform</p>
          <div className="tricolor-stripe w-36 mx-auto mt-4 rounded-full" />
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-2xl border border-slate-700/60 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Secure Sign In</h2>
              <p className="text-[11px] text-slate-400">Access the infrastructure command center</p>
            </div>
          </div>

          {error && (
            <div role="alert" className="mt-5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Fill Button for Testing */}
          <div className="mt-5 p-3.5 rounded-xl bg-blue-500/8 border border-blue-500/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">Authorized Test Account</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">admin@infralytix.gov.in</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@infralytix.gov.in');
                setPassword('Infralytix2026!');
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Fill Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div>
              <label htmlFor="login-email" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@gov.in"
                required
                autoComplete="email"
                aria-label="Email address"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-inner"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-800/60 border border-slate-700/80 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-700/50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-500 mt-6 leading-relaxed">
            By signing in, you agree to the{' '}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300 underline">Terms & Conditions</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link>.
          </p>

          <p className="text-center text-xs text-slate-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Register</Link>
          </p>
        </div>

        {/* Footer badge */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-[10px] text-slate-600 tracking-wider uppercase">
            Powered by ML Risk Prediction Engine • JWT Authenticated
          </p>
          <p className="text-[9px] text-slate-700">
            © {new Date().getFullYear()} INFRALYTIX • Government of India Initiative
          </p>
        </div>
      </div>
    </div>
  );
}
