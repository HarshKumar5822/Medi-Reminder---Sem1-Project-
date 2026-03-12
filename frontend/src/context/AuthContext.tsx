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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "medi_reminder_token";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser(token);
        } else {
            setIsLoading(false);
        }
    }, [token]);

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

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Login failed");
            }

            localStorage.setItem(STORAGE_KEY, data.access_token);
            setToken(data.access_token);
            toast.success("Welcome back!");
        } catch (err: any) {
            toast.error(err.message);
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
                isLoading
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
