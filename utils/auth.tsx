"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/components/types';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

type AuthContextType = {
    user: User | null
    logout: () => void
}

const AuthContext = createContext<AuthContextType>({ user: null, logout: () => { } });

export const AuthProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const [cookies, setCookie, removeCookie] = useCookies(['user_token']);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const token = cookies.user_token;
    useEffect(() => {
        if (token) {
            let userObject = jwtDecode(token) as User
            userObject.authToken = token
            setUser(userObject);
        } else {
            setUser(null)
            router.push('/login');
        }
    }, [token, router]);

    const logout = () => {
        removeCookie('user_token')
    }

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);