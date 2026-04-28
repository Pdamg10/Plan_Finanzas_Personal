import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Modo plantilla: siempre autenticado con usuario de demostración
    const [user] = useState<User>({
        id: '1',
        nombre: 'Usuario Demo',
        email: 'demo@finflow.app',
        moneda_principal: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    const login = () => {};
    const logout = () => {
        // En modo plantilla no hace nada
        console.log("Logout presionado - modo plantilla");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: true, loading: false }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
