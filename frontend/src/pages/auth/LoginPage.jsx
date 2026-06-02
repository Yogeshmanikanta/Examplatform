import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { S, inputStyle } from '../../constants/Auth';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success('Welcome back!');
      setTimeout(() => {
        if (['super_admin', 'admin', 'coordinator'].includes(user.role)) {
          navigate('/admin');
        } else {
          navigate('/candidate');
        }
      }, 800);
    } catch (err) {
      console.log('ERROR:', err);
      console.log('RESPONSE:', err.response);
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.root}>
      {/* Left */}
      <div style={S.left}>
        <div style={S.leftGrid} />
        <div style={S.leftGlow} />
        <div style={S.leftGlow2} />
        <div style={S.leftContent}>
          <div style={S.logo}>
            <div style={S.logoIcon}>EP</div>
            <span style={S.logoText}>ExamPlatform</span>
          </div>
          <h1 style={S.headline}>
            The smartest way to <span style={S.headlineAccent}>conduct exams</span>
          </h1>
          <p style={S.subtext}>
            AI-powered examination platform for universities, government bodies, and recruitment
            boards.
          </p>
          <div style={S.featureList}>
            {[
              'Auto evaluation for MCQs & True/False',
              'AI-powered descriptive answer grading',
              'Real-time results, ranks & percentile',
            ].map((f) => (
              <div key={f} style={S.featureItem}>
                <div style={S.featureDot} />
                <span style={S.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={S.right}>
        <div style={S.form}>
          <h2 style={S.formTitle}>Sign in</h2>
          <p style={S.formSub}>Enter your credentials to continue</p>

          <form
            onSubmit={(e) => {
              console.log('FORM SUBMIT FIRED');
              handleSubmit(e);
            }}
          >
            <div style={S.fieldWrap}>
              <label style={S.label}>Email address</label>
              <input
                type="email"
                required
                value={form.email}
                placeholder="you@example.com"
                style={inputStyle('email', focused)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div style={S.fieldWrap}>
              <label style={S.label}>Password</label>
              <input
                type="password"
                required
                value={form.password}
                placeholder="••••••••"
                style={inputStyle('password', focused)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={S.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={S.link}>
              Register here
            </Link>
          </p>
          <p style={{ ...S.footer, marginTop: '10px' }}>
            <Link to="/forgot" style={S.link}>
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
