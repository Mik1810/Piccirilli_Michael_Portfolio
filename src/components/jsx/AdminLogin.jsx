import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      setUser(null);
    } else {
      setUser(data.user);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '2rem auto', padding: '2rem', borderRadius: 8, boxShadow: '0 2px 8px #0002', background: '#fff' }}>
      <h3>Admin Login</h3>
      {user ? (
        <div>
          <p>Login effettuato come: <b>{user.email}</b></p>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 8, padding: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 8, padding: 8 }}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
            {loading ? 'Login...' : 'Login'}
          </button>
          {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default AdminLogin;
