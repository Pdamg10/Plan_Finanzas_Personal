import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Check, AlertCircle, Palette } from 'lucide-react';
import { AVATAR_COLORS, getAvatarGradient } from '../utils/avatarColors';

// ─── Reusable input field ────────────────────────────────────────────────────
function FieldInput({
  label, type = 'text', value, onChange, placeholder,
  icon: Icon, optional = false,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  icon: React.ElementType; optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text2)] pl-1 flex items-center gap-1">
        {label}
        {optional && <span className="normal-case font-semibold text-slate-400">(opcional)</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-[12px] border border-white/60 bg-white/35 focus:bg-white/60 focus:border-violet-400 outline-none transition-all font-semibold text-xs text-slate-700 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

// ─── Toast notification ───────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-[12px] text-xs font-bold border ${
      type === 'ok'
        ? 'bg-green-50/80 border-green-200 text-green-700'
        : 'bg-red-50/80 border-red-200 text-red-700'
    }`}>
      {type === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserSettingsPage() {
  const { user, updateUser } = useAuth();
  const token = localStorage.getItem('token') || '';

  // Profile fields — pre-filled with current values, all optional
  const [nombre,      setNombre]      = useState(user?.nombre      || '');
  const [email,       setEmail]       = useState(user?.email       || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || 'violet');

  // Password fields
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // UI state
  const [profileMsg, setProfileMsg] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [pwdMsg,     setPwdMsg]     = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd,     setSavingPwd]     = useState(false);

  // ── Save profile ─────────────────────────────────────────────────────────────
  // Build only the fields that actually changed so we never overwrite with empty values
  const handleSaveProfile = async () => {
    const payload: Record<string, string> = { avatar_color: avatarColor };
    if (nombre.trim()) payload.nombre = nombre.trim();
    if (email.trim())  payload.email  = email.trim();

    setSavingProfile(true);
    setProfileMsg(null);

    // Always update locally first so the sidebar reflects changes immediately
    updateUser({
      ...(payload.nombre ? { nombre: payload.nombre } : {}),
      ...(payload.email  ? { email:  payload.email  } : {}),
      avatar_color: avatarColor,
    });

    try {
      const res = await fetch('http://localhost:3000/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();          // ← read body ONCE
      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar en el servidor');
      }

      // Sync with server response (may contain updated timestamps, etc.)
      updateUser({
        nombre:       data.nombre,
        email:        data.email,
        avatar_color: data.avatar_color,
      });
      setProfileMsg({ msg: '¡Perfil actualizado correctamente!', type: 'ok' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      // Network errors or 401 (demo mode) — local save already happened above
      if (msg === 'Failed to fetch' || !msg) {
        setProfileMsg({ msg: 'Guardado localmente. (Sin conexión al servidor)', type: 'ok' });
      } else {
        setProfileMsg({ msg: msg, type: 'err' });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ msg: 'Completa los tres campos de contraseña.', type: 'err' }); return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ msg: 'La nueva contraseña y su confirmación no coinciden.', type: 'err' }); return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ msg: 'La contraseña debe tener al menos 6 caracteres.', type: 'err' }); return;
    }

    setSavingPwd(true);
    setPwdMsg(null);
    try {
      const res = await fetch('http://localhost:3000/users/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cambiar contraseña');
      setPwdMsg({ msg: '¡Contraseña cambiada correctamente!', type: 'ok' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar contraseña.';
      setPwdMsg({ msg, type: 'err' });
    } finally {
      setSavingPwd(false);
    }
  };

  const initials = (nombre || user?.nombre || 'U').charAt(0).toUpperCase();

  return (
    <div className="page active space-y-6">

      {/* Header */}
      <div className="welcome">
        <div className="welcome-text">
          <h2>Configuración de Cuenta ⚙️</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Edita tu nombre, correo, contraseña y personaliza tu avatar. Todos los campos son opcionales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── PROFILE CARD ───────────────────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title flex items-center gap-1.5">
              <User size={16} className="text-[var(--purple)]" />
              Información del Perfil
            </span>
          </div>
          <div className="card-body space-y-5">

            {/* Live avatar preview */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0 transition-all duration-300"
                style={{ background: getAvatarGradient(avatarColor) }}
              >
                {initials}
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--ink)]">{nombre || user?.nombre || 'Usuario'}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{email || user?.email || ''}</p>
              </div>
            </div>

            <FieldInput
              label="Nombre de Usuario" value={nombre} onChange={setNombre}
              placeholder={user?.nombre || 'Tu nombre'} icon={User} optional
            />
            <FieldInput
              label="Correo Electrónico" type="email" value={email} onChange={setEmail}
              placeholder={user?.email || 'correo@ejemplo.com'} icon={Mail} optional
            />

            {/* Avatar colour picker */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text2)] pl-1 flex items-center gap-1 mb-2">
                <Palette size={12} /> Color del Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c.key}
                    title={c.label}
                    onClick={() => setAvatarColor(c.key)}
                    className="relative w-8 h-8 rounded-[10px] transition-all duration-200 hover:scale-110 focus:outline-none"
                    style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                  >
                    {avatarColor === c.key && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check size={14} className="text-white drop-shadow" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {profileMsg && <Toast msg={profileMsg.msg} type={profileMsg.type} />}

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="btn btn-primary !w-full py-2.5 text-xs font-bold rounded-[12px] flex items-center justify-center gap-1.5"
            >
              {savingProfile ? 'Guardando...' : <><Check size={14} /> Guardar Cambios</>}
            </button>
          </div>
        </div>

        {/* ── PASSWORD CARD ──────────────────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title flex items-center gap-1.5">
              <Lock size={16} className="text-[var(--purple)]" />
              Cambiar Contraseña
            </span>
          </div>
          <div className="card-body space-y-5">

            <div className="p-3 rounded-[12px] bg-violet-50/60 border border-violet-100 text-[10px] text-violet-700 font-semibold leading-relaxed">
              Tu contraseña debe tener al menos 6 caracteres. Nunca la compartas con nadie.
            </div>

            <FieldInput label="Contraseña Actual"    type="password" value={currentPwd}
              onChange={setCurrentPwd} placeholder="••••••••" icon={Lock} />
            <FieldInput label="Nueva Contraseña"     type="password" value={newPwd}
              onChange={setNewPwd}     placeholder="••••••••" icon={Lock} />
            <FieldInput label="Confirmar Contraseña" type="password" value={confirmPwd}
              onChange={setConfirmPwd} placeholder="••••••••" icon={Lock} />

            {/* Strength bar */}
            {newPwd.length > 0 && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[...Array(4)].map((_, i) => {
                    const s = newPwd.length < 6 ? 1 : newPwd.length < 8 ? 2 : newPwd.length < 12 ? 3 : 4;
                    const cols = ['#f87171', '#fb923c', '#facc15', '#34d399'];
                    return (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i < s ? cols[s - 1] : '#e2e8f0' }} />
                    );
                  })}
                </div>
                <p className="text-[9px] font-bold text-slate-400">
                  {newPwd.length < 6 ? 'Muy corta' : newPwd.length < 8 ? 'Débil' : newPwd.length < 12 ? 'Moderada' : 'Fuerte'}
                </p>
              </div>
            )}

            {pwdMsg && <Toast msg={pwdMsg.msg} type={pwdMsg.type} />}

            <button
              onClick={handleChangePassword}
              disabled={savingPwd}
              className="btn btn-primary !w-full py-2.5 text-xs font-bold rounded-[12px] flex items-center justify-center gap-1.5"
            >
              {savingPwd ? 'Cambiando...' : <><Lock size={14} /> Cambiar Contraseña</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
