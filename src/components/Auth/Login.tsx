import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { AuthLayout } from './AuthLayout';
import { Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Bienvenido" subtitle="Inicia sesión para continuar">
            <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                        placeholder="tu@email.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary py-3"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Iniciar Sesión'}
                </button>

                <p className="text-center text-sm text-gray-400">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-brand-light hover:text-brand transition-colors font-medium">
                        Regístrate
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};
