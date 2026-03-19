import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "medi_reminder_token";
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:8000" : "https://medi-reminder-sem1-project-s6re.onrender.com");

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token && !user) {
            fetchUser(token);
        } else if (!token) {
            setIsLoading(false);
        }
    }, [token, user]);

    const fetchUser = async (authToken: string) => {
        try {
            const res = await fetch(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser({
                    id: userData.id,
                    name: userData.full_name,
                    email: userData.email,
                    phone: userData.phone,
                    avatar: userData.avatar
                });
            } else {
                logout();
            }
        } catch (err) {
            console.error("Failed to fetch user", err);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                // Not all backends return JSON for 4xx/5xx errors, handle plain text gracefully
                let errorMsg = "Login failed";
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.detail || errorMsg;
                } catch (e) {
                    errorMsg = await res.text() || errorMsg;
                }
                throw new Error(errorMsg);
            }

            const data = await res.json();
            localStorage.setItem(STORAGE_KEY, data.access_token);
            setToken(data.access_token);
            await fetchUser(data.access_token);
            toast.success("Welcome back!");
        } catch (err: any) {
            const errStr = err.message || "Unknown login error";
            toast.error(`Login failed: ${errStr}`);
            throw err;
        }
    };

    const register = async (email: string, password: string, fullName: string, phone: string) => {
        try {
            const res = await fetch(`${API_URL}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, full_name: fullName, phone })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Registration failed");
            }

            localStorage.setItem(STORAGE_KEY, data.access_token);
            setToken(data.access_token);
            await fetchUser(data.access_token);
            toast.success("Account created!");
        } catch (err: any) {
            toast.error(err.message);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
        toast.info("Logged out");
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!token) return;
        try {
            // Map back to API expected fields
            const body: any = {
                email: updates.email !== undefined ? updates.email : user?.email
            };
            if (updates.name !== undefined) body.full_name = updates.name;
            if (updates.phone !== undefined) body.phone = updates.phone;
            if (updates.avatar !== undefined) body.avatar = updates.avatar;

            const res = await fetch(`${API_URL}/users/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const updated = await res.json();
                setUser({
                    id: updated.id,
                    name: updated.full_name,
                    email: updated.email,
                    phone: updated.phone,
                    avatar: updated.avatar
                });
                toast.success("Profile updated");
            }
        } catch (err) {
            toast.error("Failed to update profile");
        }
    };

    const updatePassword = async (currentPassword: string, newPassword: string) => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/users/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Failed to update password");
            }

            toast.success("Password updated successfully");
        } catch (err: any) {
            toast.error(err.message);
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                updateUser,
                updatePassword,
                isAuthenticated: !!user,
                isLoading,
                token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
