import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock, MoreVertical, X as XIcon, Pill } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMedicines } from "@/hooks/useMedicines";
import { formatTime } from "@/lib/medicines";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const Schedule = () => {
    const { todayMedicines, logs, markAsTaken, markAsMissed } = useMedicines();

    const schedule = useMemo(() => {
        // Create a map of time slots
        const timeMap = new Map<string, { time: string; period: string; medicines: any[] }>();

        todayMedicines.forEach(med => {
            med.times.forEach(time => {
                if (!timeMap.has(time)) {
                    const hour = parseInt(time.split(':')[0]);
                    let period = "Morning";
                    if (hour >= 12 && hour < 17) period = "Afternoon";
                    if (hour >= 17) period = "Evening";

                    timeMap.set(time, {
                        time: formatTime(time),
                        period,
                        medicines: []
                    });
                }

                // Check if this specific instance has been logged (taken/skipped)
                // We need to match medicineId and scheduledTime
                // In a real app, date would also be checked (already filtered in useMedicines for today)
                const log = logs.find(l => l.medicineId === med.id && l.scheduledTime === time && l.date === new Date().toISOString().split('T')[0]);

                let status = 'pending';
                if (log) {
                    status = log.status === 'missed' ? 'skipped' : 'taken';
                }

                timeMap.get(time)?.medicines.push({
                    id: med.id,
                    name: med.name,
                    dosage: med.dosage,
                    type: "Pill", // Defaulting type for now as it's not in Medicine interface yet
                    status,
                    scheduledTime: time
                });
            });
        });

        // Sort by time
        return Array.from(timeMap.values()).sort((a, b) => {
            const dateA = new Date(`1970/01/01 ${a.time}`);
            const dateB = new Date(`1970/01/01 ${b.time}`);
            return dateA.getTime() - dateB.getTime();
        });
    }, [todayMedicines, logs]);

    const handleAction = (medId: string, time: string, action: 'taken' | 'skipped' | 'pending') => {
        if (action === 'taken') {
            markAsTaken(medId, time);
        } else if (action === 'skipped') {
            markAsMissed(medId, time);
        }
        // 'pending' logic (undo) would require removing from log, which needs extending Context
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'taken':
                return <Check className="h-5 w-5" />;
            case 'skipped':
                return <XIcon className="h-5 w-5" />;
            default:
                return <Pill className="h-5 w-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'taken':
                return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'skipped':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-primary/10 text-primary';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Schedule</h1>
                    <p className="text-muted-foreground">Your daily medicine timeline</p>
                </div>
                <Link to="/add">
                    <Button>Add Reminder</Button>
                </Link>
            </header>

            <div className="space-y-6">
                {schedule.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No medicines scheduled for today.
                    </div>
                ) : (
                    schedule.map((slot, slotIndex) => (
                        <div key={slotIndex} className="relative pl-8 border-l-2 border-muted pb-8 last:pb-0">
                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />

                            <div className="mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{slot.time}</span>
                                <span className="text-sm text-muted-foreground">• {slot.period}</span>
                            </div>

                            <div className="grid gap-4">
                                {slot.medicines.map((med, medIndex) => (
                                    <Card key={`${med.id}-${med.scheduledTime}`} className={`transition-all ${med.status !== 'pending' ? 'opacity-60 bg-muted/50' : 'hover:shadow-md'}`}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor(med.status)}`}>
                                                    {getStatusIcon(med.status)}
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold ${med.status !== 'pending' ? 'line-through text-muted-foreground' : ''}`}>
                                                        {med.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                                                </div>
                                            </div>

                                            {med.status === 'pending' && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAction(med.id, med.scheduledTime, 'skipped')}
                                                    >
                                                        Skip
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAction(med.id, med.scheduledTime, 'taken')}
                                                    >
                                                        Take
                                                    </Button>
                                                </div>
                                            )}
                                            {med.status !== 'pending' && (
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium mr-2 capitalize">{med.status}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Schedule;
