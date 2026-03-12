import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Pill, HeartPulse } from "lucide-react";
import { useMedicines } from "@/hooks/useMedicines";
import { formatTime, getGreeting } from "@/lib/medicines";
import NotificationBell from "@/components/NotificationBell";
import { VitalsModal } from "@/components/VitalsModal";
import { useState } from "react";
import { toast } from "sonner";

const Dashboard = () => {
    const { medicines, todayMedicines, logs } = useMedicines();
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

    // Calculate stats
    const todayLogs = logs.filter(l => l.date === new Date().toISOString().split('T')[0]);
    const takenCount = todayLogs.filter(l => l.status === 'taken').length;
    const missedCount = todayLogs.filter(l => l.status === 'missed').length;

    // Get next upcoming medicines (limit to 3)
    // Flatten all upcoming times for today
    const upcoming = todayMedicines.flatMap(med =>
        med.times.map(time => ({ ...med, time }))
    )
        .filter(item => {
            // Filter out times that have already passed or been logged
            const [h, m] = item.time.split(':').map(Number);
            const now = new Date();
            const itemTime = new Date();
            itemTime.setHours(h, m, 0, 0);

            const isLogged = todayLogs.some(l => l.medicineId === item.id && l.scheduledTime === item.time);

            return itemTime > now && !isLogged;
        })
        .sort((a, b) => {
            const [h1, m1] = a.time.split(':').map(Number);
            const [h2, m2] = b.time.split(':').map(Number);
            return (h1 * 60 + m1) - (h2 * 60 + m2);
        })
        .slice(0, 3);

    const handleVitalsSubmit = async (vitals: any) => {
        const token = localStorage.getItem("medi_reminder_token");
        if (!token) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
            const res = await fetch(`${API_URL}/vitals/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(vitals)
            });

            if (!res.ok) throw new Error("Failed to save vitals");
            toast.success("Vitals completely logged! ❤️");
        } catch (error) {
            toast.error("Error saving vitals. Try again.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">{getGreeting()}, User</p>
                </div>
                <NotificationBell />
            </header>

            {/* Floating Action Button for Vitals */}
            <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50">
                <Button
                    className="rounded-full shadow-xl h-14 w-14 md:h-16 md:w-16 gradient-hero text-primary-foreground flex flex-col items-center justify-center p-0 transition-transform hover:scale-105 hover:shadow-2xl border-4 border-background"
                    onClick={() => setIsVitalsModalOpen(true)}
                    // Removed aria-label because visible label might be better, but the icon is clear
                    title="Log Daily Vitals"
                >
                    <HeartPulse className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
            </div>

            <VitalsModal
                open={isVitalsModalOpen}
                onClose={() => setIsVitalsModalOpen(false)}
                onSubmit={handleVitalsSubmit}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Medicines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{medicines.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Taken Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{takenCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Missed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{missedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Medicines */}
            <section>
                <h2 className="text-xl font-bold mb-4">Upcoming Medicines</h2>
                {upcoming.length > 0 ? (
                    <div className="grid gap-4">
                        {upcoming.map((med, i) => (
                            <Card key={`${med.id}-${i}`} className="flex flex-row items-center p-4 transition-all hover:shadow-lg">
                                <div className="bg-primary/10 p-3 rounded-full mr-4">
                                    <Pill className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{med.name}</h3>
                                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{formatTime(med.time)}</p>
                                    <Button size="sm" variant="secondary">Take Now</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground glass-card">
                        No upcoming medicines for the rest of the day.
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
