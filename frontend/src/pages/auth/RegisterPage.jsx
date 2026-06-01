import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { S ,inputStyle} from '../../constants/Auth';



export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', mobile: '', password: '',confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  
  const [focused, setFocused] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      const otp = res.data.data.dev_otp;
      
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
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
               The smartest way to{' '}
               <span style={S.headlineAccent}>conduct exams</span>
             </h1>
             <p style={S.subtext}>
               AI-powered examination platform for universities, government bodies, and recruitment boards.
             </p>
             <div style={S.featureList}>
               {[
                 'Auto evaluation for MCQs & True/False',
                 'AI-powered descriptive answer grading',
                 'Real-time results, ranks & percentile',
               ].map(f => (
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
   
             <form onSubmit={handleSubmit}>
               <div style={S.fieldWrap}>
                 <label style={S.label}>Full Name</label>
                 <input
                   type="text" required value={form.full_name}
                   placeholder="John Doe"
                   style={inputStyle('full_name', focused)}
                   onFocus={() => setFocused('full_name')}
                   onBlur={() => setFocused('')}
                   onChange={e => setForm({ ...form, full_name: e.target.value })}
                 />
               </div>
               <div style={S.fieldWrap}>
                 <label style={S.label}>Email address</label>
                 <input
                   type="email" required value={form.email}
                   placeholder="you@example.com"
                   style={inputStyle('email', focused )}
                   onFocus={() => setFocused('email')}
                   onBlur={() => setFocused('')}
                   onChange={e => setForm({ ...form, email: e.target.value })}
                 />

               </div>
               <div style={S.fieldWrap}>
                 <label style={S.label}>Mobile Number</label>
                 <input
                   type="text" required value={form.mobile}
                   placeholder="123-456-7890"
                   style={inputStyle('mobile', focused  )}
                   onFocus={() => setFocused('mobile')}
                   onBlur={() => setFocused('')}
                   onChange={e => setForm({ ...form, mobile: e.target.value })}


                 />
               </div>
               <div style={S.fieldWrap}>
                 <label style={S.label}>Password</label>
                 <input
                   type="password" required value={form.password}
                   placeholder="••••••••"
                   style={inputStyle('password', focused)}
                   onFocus={() => setFocused('password')}
                   onBlur={() => setFocused('')}
                   onChange={e => setForm({ ...form, password: e.target.value })}
                 />
               </div>

                <div style={S.fieldWrap}>
                 <label style={S.label}>Confirm Password</label>
                 <input
                   type="password" required value={form.confirm_password}
                   placeholder="••••••••"
                   style={inputStyle('confirm_password', focused)}
                   onFocus={() => setFocused('confirm_password')}
                   onBlur={() => setFocused('')}
                   onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                 />
               </div>
               <button
                 type="submit" disabled={loading}
                 style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
               >
                 {loading ? 'Signing in…' : 'Sign In →'}
               </button>
             </form>
   
             <p style={S.footer}>
               Already have an account?{' '}
               <Link to="/login" style={S.link}>go to log in page</Link>
             </p>
           </div>
         </div>
       </div>
     );

}