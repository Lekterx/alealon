import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl bg-accent text-white mx-auto mb-3">AA</div>
          <h1 className="text-xl font-bold text-text-primary">Administration</h1>
          <p className="text-sm text-text-secondary">Alé Alon — Back-office</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-card p-6 shadow-sm space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" placeholder="admin@alealon.re" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-white font-semibold text-sm py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
