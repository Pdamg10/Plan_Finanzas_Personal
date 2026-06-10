import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegisterMode ? { email, password, nombre } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error('No se pudo parsear el JSON:', text);
      }

      if (!res.ok) {
        if (data.message === 'User already exists') {
          throw new Error('Ya existe una cuenta con este correo.');
        }
        throw new Error(data.message || `Error del servidor: ${res.status} ${res.statusText}`);
      }

      // Si las credenciales son incorrectas, nuestro backend actualmente devuelve 201 Created con { message: 'Invalid credentials' } 
      // y no lanza un código de error HTTP (esto es un bug del backend, pero lo manejamos aquí)
      if (data.message === 'Invalid credentials') {
        throw new Error('Credenciales incorrectas');
      }

      login(data.access_token, data.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'Failed to fetch') {
        setError('No se pudo conectar con el servidor. Verifica que el servidor esté activo.');
      } else {
        setError(msg || 'Ocurrió un error inesperado');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden text-[var(--ink)]">
      {/* Background blobs to match site aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400/20 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-400/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>

      <div className="card w-full max-w-[400px] p-8 mx-4 z-10 !rounded-[24px] shadow-[var(--shadow)] bg-white/45 border border-white/80 backdrop-blur-[24px]">
        
        {/* Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-400 to-violet-600 p-0.5 mb-4 shadow-lg shadow-violet-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-white/90 flex items-center justify-center">
              <User size={32} className="text-violet-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-[var(--ink)] tracking-tight">FinFlow</h1>
          <p className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text2)] mt-0.5">Soporte de Decisiones Financieras</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100/60 border border-red-200 text-red-700 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div className="field">
              <label className="text-xs font-bold text-[var(--text2)] pl-1">Nombre Completo</label>
              <div className="relative mt-1">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full !pl-11 pr-4 py-2.5 rounded-[12px] border border-white/60 bg-white/35 focus:bg-white/60 focus:border-violet-500 outline-none transition-all font-bold text-xs text-slate-700 placeholder:text-slate-400"
                  placeholder="Ej. Juan Pérez"
                  required={isRegisterMode}
                />
              </div>
            </div>
          )}

          <div className="field">
            <label className="text-xs font-bold text-[var(--text2)] pl-1">Correo Electrónico</label>
            <div className="relative mt-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full !pl-11 pr-4 py-2.5 rounded-[12px] border border-white/60 bg-white/35 focus:bg-white/60 focus:border-violet-500 outline-none transition-all font-bold text-xs text-slate-700 placeholder:text-slate-400"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="text-xs font-bold text-[var(--text2)] pl-1">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full !pl-11 pr-4 py-2.5 rounded-[12px] border border-white/60 bg-white/35 focus:bg-white/60 focus:border-violet-500 outline-none transition-all font-bold text-xs text-slate-700 placeholder:text-slate-400"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary !w-full py-3 mt-4 text-xs font-bold rounded-[12px] flex justify-center items-center gap-1.5"
          >
            {isLoading ? 'Procesando...' : (isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
            className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors bg-transparent border-none outline-none cursor-pointer"
          >
            {isRegisterMode ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
