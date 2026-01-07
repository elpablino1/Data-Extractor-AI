import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('rememberedEmail'));
    const [resetSent, setResetSent] = useState(false);
    const { signIn, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Por favor, ingresa tu email primero');
            return;
        }
        setError('');
        setLoading(true);
        const { error } = await resetPassword(email);
        if (error) {
            setError(error.message);
        } else {
            setResetSent(true);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message === 'Invalid login credentials'
                ? 'Email o contraseña incorrectos'
                : error.message);
            setLoading(false);
        } else {
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-pres-bg px-4">
            <div className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">AI Data Extractor</h1>
                    <p className="text-brand-pres-teal font-medium tracking-wide uppercase text-xs">Inteligencia Artificial & Storytelling</p>
                </div>

                {/* Login Form */}
                <div className="bg-brand-pres-card rounded-2xl shadow-2xl p-8 border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-brand-pres-bg border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-brand-pres-teal focus:border-transparent outline-none transition-all"
                                    placeholder="tu@email.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-11 pr-12 py-3 bg-brand-pres-bg border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-brand-pres-teal focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-brand-pres-teal transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-white/10 bg-brand-pres-bg text-brand-pres-teal focus:ring-0"
                                    />
                                    Recordarme
                                </label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs text-brand-pres-teal hover:text-brand-pres-blue transition-colors"
                                >
                                    ¿Olvidaste la contraseña?
                                </button>
                            </div>
                        </div>

                        {/* Success Message for Reset */}
                        {resetSent && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
                                Se ha enviado un correo para restablecer tu contraseña.
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-brand-pres-teal to-brand-pres-blue text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            ¿No tenés cuenta?{' '}
                            <Link to="/register" className="text-brand-pres-teal hover:text-brand-pres-blue transition-colors font-medium">
                                Crear cuenta
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
