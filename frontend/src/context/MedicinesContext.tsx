import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Medicine, MedicineLog, getTodayStr } from "@/lib/medicines";
import { useAuth } from "./AuthContext";
// We need to access the token slightly differently or pass it in. 
// For simplicity in this architecture, we'll read from localStorage directly in the fetch calls here
// or better, we could make this context dependent on AuthContext, but let's keep it simple.

const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? "http://localhost:8000" : "https://medi-reminder-sem1-project-s6re.onrender.com";
const STORAGE_KEY = "medi_reminder_token";

interface MedicinesContextType {
    medicines: Medicine[];
    logs: MedicineLog[];
    todayMedicines: Medicine[];
    addMedicine: (med: Omit<Medicine, "id" | "status">) => Promise<void>;
    updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<void>;
    deleteMedicine: (id: string) => Promise<void>;
    refillMedicine: (id: string, amount: number) => Promise<void>;
    markAsTaken: (medicineId: string, time: string) => Promise<void>;
    markAsMissed: (medicineId: string, time: string) => Promise<void>;
    getAdherenceData: () => { day: string; taken: number; missed: number; total: number }[];
    getAdherencePercentage: () => number;
    refreshData: () => void;
}

const MedicinesContext = createContext<MedicinesContextType | undefined>(undefined);

export function MedicinesProvider({ children }: { children: ReactNode }) {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [logs, setLogs] = useState<MedicineLog[]>([]);
    const { token } = useAuth();

    const getToken = () => localStorage.getItem(STORAGE_KEY);

    const fetchData = useCallback(async () => {
        if (!token) {
            setMedicines([]);
            setLogs([]);
            return;
        }

        try {
            const [medsRes, logsRes] = await Promise.all([
                fetch(`${API_URL}/medicines/`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/logs/`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (medsRes.ok) {
                const meds = await medsRes.json();
                // Map backend snake_case to frontend camelCase if needed, 
                // but our Pydantic models use snake_case for fields like start_date.
                // Let's assume frontend Medicine interface matches or we map it.
                // Looking at lib/medicines.ts, it expects startDate.
                // Get today's logs to calculate accurate status
                const todayRes = await fetch(`${API_URL}/logs/`, { headers: { Authorization: `Bearer ${token}` } });
                let todayLogs: any[] = [];
                if (todayRes.ok) {
                    const l = await todayRes.json();
                    setLogs(l.map((log: any) => ({
                        ...log,
                        medicineId: log.medicine_id,
                        medicineName: log.medicine_name,
                        scheduledTime: log.scheduled_time
                    })));
                    const todayStr = getTodayStr();
                    todayLogs = l.filter((log: any) => log.date === todayStr);
                }

                setMedicines(meds.map((m: any) => {
                    // Logic to determine status:
                    // If all times for today are logged as 'taken', status is 'taken'.
                    // If any time is missed, 'missed'.
                    // Otherwise 'upcoming'.
                    let currentStatus = "upcoming";

                    if (m.times && Array.isArray(m.times) && m.times.length > 0) {
                        const medLogs = todayLogs.filter(log => log.medicine_id === m.id);

                        // Have all schedule times been accounted for?
                        const allTaken = m.times.every((time: string) =>
                            medLogs.some(log => log.scheduled_time === time && log.status === "taken")
                        );

                        const anyMissed = medLogs.some(log => log.status === "missed");

                        if (anyMissed) {
                            currentStatus = "missed";
                        } else if (allTaken) {
                            currentStatus = "taken";
                        }
                    }

                    return {
                        ...m,
                        startDate: m.start_date,
                        endDate: m.end_date,
                        dependentName: m.dependent_name,
                        status: currentStatus // Override any static backend status
                    };
                }));
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    }, [token]);

    // Poll for data or fetch on mount/token change
    useEffect(() => {
        fetchData();
        // Simple polling or event listener could go here
        const interval = setInterval(fetchData, 5000); // Poll every 5s to keep in sync
        return () => clearInterval(interval);
    }, [fetchData]);

    const addMedicine = useCallback(async (med: Omit<Medicine, "id" | "status">) => {
        if (!token) throw new Error("Not authenticated");

        // Map to backend expected format
        const payload = {
            ...med,
            start_date: med.startDate,
            end_date: med.endDate,
            dependent_name: med.dependentName || null
        };

        const res = await fetch(`${API_URL}/medicines/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Failed to add medicine:", errText);
            throw new Error(`Error ${res.status}: ${errText}`);
        }
        
        // Optimistically update local state so UI feels instant, then fetch background sync
        const createdMed = await res.json();
        const newMed = {
            ...createdMed,
            startDate: createdMed.start_date,
            endDate: createdMed.end_date,
            dependentName: createdMed.dependent_name,
            status: "upcoming"
        };
        
        setMedicines(prev => [...prev, newMed]);
        fetchData(); // Don't await this, let it happen in background
    }, [token, fetchData]);

    const updateMedicine = useCallback(async (id: string, updates: Partial<Medicine>) => {
        // Implement if backend supports PATCH/PUT
    }, []);

    const deleteMedicine = useCallback(async (id: string) => {
        if (!token) return;
        await fetch(`${API_URL}/medicines/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
    }, [token, fetchData]);

    const refillMedicine = useCallback(async (id: string, amount: number) => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/medicines/${id}/refill`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });
            fetchData();
        } catch (err) {
            console.error("Failed to refill", err);
        }
    }, [token, fetchData]);

    const markAsTaken = useCallback(async (medicineId: string, time: string) => {
        if (!token) return;

        // Find med details
        const med = medicines.find(m => m.id === medicineId);
        if (!med) return;

        const payload = {
            medicine_id: medicineId,
            medicine_name: med.name,
            dosage: med.dosage,
            scheduled_time: time,
            date: getTodayStr(),
            status: "taken",
            taken_at: new Date().toISOString()
        };

        await fetch(`${API_URL}/logs/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        fetchData();
    }, [token, medicines, fetchData]);

    const markAsMissed = useCallback(async (medicineId: string, time: string) => {
        if (!token) return;

        const med = medicines.find(m => m.id === medicineId);
        if (!med) return;

        const payload = {
            medicine_id: medicineId,
            medicine_name: med.name,
            dosage: med.dosage,
            scheduled_time: time,
            date: getTodayStr(),
            status: "missed"
        };

        await fetch(`${API_URL}/logs/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        fetchData();
    }, [token, medicines, fetchData]);

    const todayMedicines = medicines.filter((m) => {
        const today = getTodayStr();
        return m.startDate <= today && m.endDate >= today;
    });

    const getAdherenceData = useCallback(() => {
        const days: { day: string; taken: number; missed: number; total: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const dayName = d.toLocaleDateString("en", { weekday: "short" });
            const dayLogs = logs.filter((l) => l.date === dateStr);
            const taken = dayLogs.filter((l) => l.status === "taken").length;
            const missed = dayLogs.filter((l) => l.status === "missed").length;
            days.push({ day: dayName, taken, missed, total: taken + missed });
        }
        return days;
    }, [logs]);

    const getAdherencePercentage = useCallback(() => {
        const weekLogs = logs.filter((l) => {
            const d = new Date(l.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return d >= weekAgo;
        });
        if (weekLogs.length === 0) return 100;
        const taken = weekLogs.filter((l) => l.status === "taken").length;
        return Math.round((taken / weekLogs.length) * 100);
    }, [logs]);

    return (
        <MedicinesContext.Provider
            value={{
                medicines,
                logs,
                todayMedicines,
                addMedicine,
                updateMedicine,
                deleteMedicine,
                refillMedicine,
                markAsTaken,
                markAsMissed,
                getAdherenceData,
                getAdherencePercentage,
                refreshData: fetchData
            }}
        >
            {children}
        </MedicinesContext.Provider>
    );
}

export function useMedicinesContext() {
    const context = useContext(MedicinesContext);
    if (context === undefined) {
        throw new Error("useMedicinesContext must be used within a MedicinesProvider");
    }
    return context;
}
