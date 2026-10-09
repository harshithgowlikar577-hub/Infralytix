import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Shield, Eye, EyeOff, UserPlus, Building2 } from 'lucide-react';
import infralytixLogo from '../assets/logo.png';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', ministry: '', role: 'ProjectManager' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030B16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative w-full max-w-[440px]">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl mx-auto" />
            <img
              src={infralytixLogo}
              alt="INFRALYTIX Official Emblem"
              className="w-20 h-20 object-contain drop-shadow-2xl relative z-10 transition-transform hover:scale-105 duration-300"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wider">INFRALYTIX</h1>
          <p className="text-sm text-slate-400 mt-1.5 tracking-wide">Register for Authorized Access</p>
          <div className="tricolor-stripe w-36 mx-auto mt-4 rounded-full" />
        </div>

        {/* Registration Card */}
        <div className="glass-card p-8 rounded-2xl border border-slate-700/60 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Account</h2>
              <p className="text-[11px] text-slate-400">Join the infrastructure intelligence network</p>
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input id="reg-name" type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required
                placeholder="Dr. Rajesh Kumar" autoComplete="name" aria-label="Full name"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-inner" />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                placeholder="officer@gov.in" autoComplete="email" aria-label="Email address"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-inner" />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  placeholder="Min 6 characters" autoComplete="new-password" aria-label="Password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-800/60 border border-slate-700/80 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-inner" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-700/50">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-ministry" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> Ministry (Optional)
                </span>
              </label>
              <input id="reg-ministry" type="text" value={form.ministry} onChange={(e) => setForm({ ...form, ministry: e.target.value })}
                placeholder="Ministry of Road Transport & Highways" autoComplete="organization" aria-label="Ministry or organization"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-inner" />
            </div>
            <div>
              <label htmlFor="reg-role" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Role</label>
              <select id="reg-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} aria-label="Select your role"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer">
                <option value="ProjectManager">Project Manager</option>
                <option value="MinistryOfficer">Ministry Officer</option>
                <option value="PublicViewer">Public Viewer</option>
              </select>
            </div>

            <div className="flex items-start gap-2.5 mt-2">
              <input type="checkbox" id="reg-consent" required
                className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/30 cursor-pointer" />
              <label htmlFor="reg-consent" className="text-[11px] text-slate-400 leading-relaxed cursor-pointer">
                I agree to the <Link to="/terms" className="text-blue-400 hover:text-blue-300 underline">Terms & Conditions</Link> and
                acknowledge the <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link> in
                compliance with the DPDP Act 2023.
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-sm font-bold hover:from-blue-500 hover:to-indigo-400 transition-all duration-300 disabled:opacity-50 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-8">
            Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign In</Link>
          </p>
        </div>

        {/* Footer badge */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-[10px] text-slate-600 tracking-wider uppercase">
            Secured under National Data Governance Framework
          </p>
          <p className="text-[9px] text-slate-700">
            © {new Date().getFullYear()} INFRALYTIX • Government of India Initiative
          </p>
        </div>
      </div>
    </div>
  );
}
