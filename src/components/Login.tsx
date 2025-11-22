
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Espera un momento.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('ERROR DE CONFIGURACIÓN: Habilita "Authentication" en tu consola de Firebase.');
      } else if (err.code === 'auth/operation-not-allowed') {
         setError('Habilita "Email/Password" en Sign-in method en Firebase Console.');
      } else {
        setError('Error de conexión: ' + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-dark-800/80 backdrop-blur-xl p-8 rounded-2xl border border-dark-700 w-full max-w-md shadow-2xl z-10 relative">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-700 to-dark-900 border border-dark-600 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <Lock size={28} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-1">Coimpormedica CRM</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Sistema de Gestión Comercial Integral</p>

        {error && (
          <div className="p-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-fadeIn bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold mb-2 ml-1">Usuario</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-900/50 border border-dark-600 rounded-xl p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              placeholder="usuario@coimpormedica.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold mb-2 ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-900/50 border border-dark-600 rounded-xl p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-dark-900 font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {loading ? 'Verificando...' : <><LogIn size={18} /> Ingresar al Sistema</>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dark-700 text-center">
            <p className="text-xs text-slate-500">Acceso restringido únicamente a personal autorizado.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
