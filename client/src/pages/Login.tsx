import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Chrome } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Failed to fetch') {
         setError('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.');
      } else {
         setError(err.message || 'Ocurrió un error inesperado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 to-blue-500 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl w-full max-w-[400px] relative z-10 mx-4">
        <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-400 to-violet-600 p-1 mb-4 shadow-lg shadow-violet-500/30">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <User size={40} className="text-violet-500" />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Iniciar Sesión</h1>
        </div>

        {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-sm font-medium text-center border border-red-100">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1 px-1">
                <label className="text-sm font-bold text-slate-700">Correo Electrónico</label>
                <a href="#" className="text-xs font-semibold text-violet-600 hover:text-violet-700">¿Olvidaste tu contraseña?</a>
            </div>
            <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    placeholder="Ingresa tu correo"
                    required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 px-1">Contraseña</label>
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    placeholder="Ingresa tu contraseña"
                    required
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-lg shadow-xl shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {isLoading ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8">
            <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500 font-medium z-10">o continuar con</span>
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
            </div>

            <div className="mt-6 flex justify-center gap-4">
                <button className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                    <Chrome size={24} className="text-slate-700" />
                </button>
            </div>
        </div>
        
        <p className="mt-8 text-center text-slate-600">
            ¿No tienes cuenta?{' '}
            <a href="#" className="font-bold text-violet-600 hover:text-violet-700 hover:underline">Regístrate &gt;</a>
        </p>
      </div>
    </div>
  );
}
