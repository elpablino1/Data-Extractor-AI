import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { AuthLayout } from './AuthLayout';
import { Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                // Create profile entry
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            full_name: fullName,
                            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
                        },
                    ]);

                if (profileError) {
                    console.error("Error creating profile:", profileError);
                    // Continue anyway as auth worked
                }
            }

            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Crear Cuenta" subtitle="Únete a la plataforma de análisis">
            <form onSubmit={handleRegister} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nombre Completo</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                        placeholder="Juan Pérez"
                        required
                    />
                </div>

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
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary py-3"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Registrarse'}
                </button>

                <p className="text-center text-sm text-gray-400">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-brand-light hover:text-brand transition-colors font-medium">
                        Inicia Sesión
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};
