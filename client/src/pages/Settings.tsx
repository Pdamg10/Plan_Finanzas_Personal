// ... imports
import { useState, useEffect } from 'react';
import { User, Mail, DollarSign, Bell, Save, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState({
      nombre: '',
      email: '',
      moneda_principal: 'USD'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings State
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
      try {
          const res = await fetch('http://localhost:3000/users/profile');
          if (res.ok) {
              const data = await res.json();
              setProfile({
                  nombre: data.nombre,
                  email: data.email,
                  moneda_principal: data.moneda_principal || 'USD'
              });
          }
      } catch (error) {
          console.error("Error fetching profile", error);
      } finally {
          setLoading(false);
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
          const res = await fetch('http://localhost:3000/users/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(profile)
          });
          if (res.ok) {
              alert('Perfil actualizado correctamente');
          }
      } catch (error) {
          console.error("Error updating profile", error);
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="p-8 text-center">Cargando configuración...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Configuración</h1>
          <p className="text-gray-600">Administra tu cuenta y preferencias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
              <div className="card text-center py-8">
                  <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {profile.nombre.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{profile.nombre}</h2>
                  <p className="text-sm text-gray-500 mb-6">{profile.email}</p>
                  
                  <div className="flex justify-center gap-2">
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">Pro Member</span>
                  </div>
              </div>

              <div className="card p-0 overflow-hidden">
                  <button onClick={logout} className="w-full p-4 flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors">
                      <LogOut size={20} />
                      <span className="font-medium">Cerrar Sesión</span>
                  </button>
              </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Form */}
              <form onSubmit={handleSave} className="card">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <User size={20} className="text-blue-500" />
                      Información Personal
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                              <input 
                                  type="text" 
                                  value={profile.nombre}
                                  onChange={e => setProfile({...profile, nombre: e.target.value})}
                                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-colors"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <div className="relative">
                                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <input 
                                      type="email" 
                                      value={profile.email}
                                      disabled
                                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                  />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda Principal</label>
                          <div className="relative">
                               <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                               <select 
                                  value={profile.moneda_principal}
                                  onChange={e => setProfile({...profile, moneda_principal: e.target.value})}
                                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white appearance-none"
                               >
                                  <option value="USD">USD - Dólar Estadounidense</option>
                                  <option value="EUR">EUR - Euro</option>
                                  <option value="MXN">MXN - Peso Mexicano</option>
                                  <option value="COP">COP - Peso Colombiano</option>
                               </select>
                          </div>
                      </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                      <button 
                          type="submit" 
                          disabled={saving}
                          className="btn-primary flex items-center gap-2"
                      >
                          {saving ? 'Guardando...' : (
                              <>
                                  <Save size={18} />
                                  Guardar Cambios
                              </>
                          )}
                      </button>
                  </div>
              </form>

              {/* Preferences */}
              <div className="card">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                       <Shield size={20} className="text-purple-500" />
                       Preferencias
                  </h3>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${notifications ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                                  <Bell size={20} />
                              </div>
                              <div>
                                  <p className="font-medium text-gray-800">Notificaciones</p>
                                  <p className="text-sm text-gray-500">Recibir alertas de presupuesto y recordatorios</p>
                              </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
