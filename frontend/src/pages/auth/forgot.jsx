import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { S, inputStyle } from '../../constants/Auth';

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: form.email });
      const devOtp = res.data.data.dev_otp;
      toast.success('Reset code sent to your email.');
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email: form.email,
        otp: form.otp,
        password: form.password,
        confirm_password: form.confirm_password,
      });
      toast.success('Password reset successfully. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.root}>
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
            Recover your account and{' '}
            <span style={S.headlineAccent}>reset your password</span>
          </h1>
          <p style={S.subtext}>
            Enter your registered email to receive a reset code, then set a new password for your account.
          </p>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.form}>
          <h2 style={S.formTitle}>{otpSent ? 'Reset your password' : 'Forgot password'}</h2>
          <p style={S.formSub}>
            {otpSent
              ? 'Enter the code sent to your email and choose a new password.'
              : 'Provide your email address to receive a password reset code.'}
          </p>

          <form onSubmit={otpSent ? handleResetPassword : handleRequestReset}>
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

            {otpSent && (
              <>
                <div style={S.fieldWrap}>
                  <label style={S.label}>Reset code</label>
                  <input
                    type="text"
                    required
                    value={form.otp}
                    placeholder="123456"
                    style={inputStyle('otp', focused)}
                    onFocus={() => setFocused('otp')}
                    onBlur={() => setFocused('')}
                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  />
                </div>
                <div style={S.fieldWrap}>
                  <label style={S.label}>New password</label>
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
                <div style={S.fieldWrap}>
                  <label style={S.label}>Confirm password</label>
                  <input
                    type="password"
                    required
                    value={form.confirm_password}
                    placeholder="••••••••"
                    style={inputStyle('confirm_password', focused)}
                    onFocus={() => setFocused('confirm_password')}
                    onBlur={() => setFocused('')}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
            >
              {loading
                ? otpSent ? 'Resetting…' : 'Sending code…'
                : otpSent ? 'Reset password' : 'Send reset code'}
            </button>
          </form>

          <p style={S.footer}>
            <Link to="/login" style={S.link}>Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
