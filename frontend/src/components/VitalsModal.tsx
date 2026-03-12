import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTodayStr } from "@/lib/medicines";
import { HeartPulse } from "lucide-react";

interface VitalsModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (vitals: any) => Promise<void>;
}

export function VitalsModal({ open, onClose, onSubmit }: VitalsModalProps) {
    const [bloodPressure, setBloodPressure] = useState("");
    const [heartRate, setHeartRate] = useState("");
    const [temperature, setTemperature] = useState("");
    const [symptoms, setSymptoms] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const now = new Date();
            await onSubmit({
                blood_pressure: bloodPressure || null,
                heart_rate: heartRate ? parseInt(heartRate) : null,
                temperature: temperature || null,
                symptoms: symptoms || null,
                date: getTodayStr(),
                time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
            });
            // Clear form
            setBloodPressure("");
            setHeartRate("");
            setTemperature("");
            setSymptoms("");
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HeartPulse className="h-5 w-5 text-red-500" />
                        Log Daily Vitals
                    </DialogTitle>
                    <DialogDescription>
                        Track your health metrics. Leave blank if not measured today.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bp">Blood Pressure</Label>
                            <Input
                                id="bp"
                                placeholder="120/80"
                                value={bloodPressure}
                                onChange={(e) => setBloodPressure(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hr">Heart Rate (bpm)</Label>
                            <Input
                                id="hr"
                                type="number"
                                placeholder="72"
                                value={heartRate}
                                onChange={(e) => setHeartRate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="temp">Temperature</Label>
                        <Input
                            id="temp"
                            placeholder="98.6 °F or 37 °C"
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="symptoms">Symptoms & Notes</Label>
                        <Textarea
                            id="symptoms"
                            placeholder="Headache, fatigue, feeling better..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="resize-none h-20"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Vitals"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
