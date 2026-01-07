import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for mock session first (Developer Bypass persistence)
        const mockSessionStr = localStorage.getItem('mock_session');
        if (mockSessionStr) {
            try {
                const mockSession = JSON.parse(mockSessionStr);
                setSession(mockSession);
                setUser(mockSession.user ?? null);
                setLoading(false);
                return;
            } catch (e) {
                console.error('Error parsing mock session:', e);
                localStorage.removeItem('mock_session');
            }
        }

        // Check active session from Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        // Developer bypass for testing
        if (email === 'dev@test.com' && password === 'admin123') {
            const mockUser = {
                id: '12345',
                email: 'dev@test.com',
                user_metadata: { full_name: 'Dev Tester' }
            } as any;
            const mockSession = {
                user: mockUser,
                access_token: 'mock-token',
                refresh_token: 'mock-refresh'
            } as any;
            localStorage.setItem('mock_session', JSON.stringify(mockSession));
            setSession(mockSession);
            setUser(mockUser);
            return { error: null };
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return { error };
    };

    const signOut = async () => {
        localStorage.removeItem('mock_session');
        await supabase.auth.signOut();
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        return { error };
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
