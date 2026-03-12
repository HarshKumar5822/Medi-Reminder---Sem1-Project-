import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { History, CheckCircle2, AlertCircle, Filter, HeartPulse, Activity, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMedicines } from "@/hooks/useMedicines";
import { formatTime } from "@/lib/medicines";
import { toast } from "sonner";

export default function HistoryPage() {
  const { logs } = useMedicines();
  const [dateFilter, setDateFilter] = useState("");
  const [vitals, setVitals] = useState<any[]>([]);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const token = localStorage.getItem("medi_reminder_token");
        if (!token) return;
        const API_URL = import.meta.env.VITE_API_URL || "https://medi-reminder-sem1-project-s6re.onrender.com";
        const res = await fetch(`${API_URL}/vitals/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setVitals(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchVitals();
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (!dateFilter) return sorted;
    return sorted.filter((l) => l.date === dateFilter);
  }, [logs, dateFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const log of filtered) {
      if (!groups[log.date]) groups[log.date] = [];
      groups[log.date].push(log);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-cool">
            <History className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">History</h1>
            <p className="text-sm text-muted-foreground">{logs.length} records</p>
          </div>
        </div>

        <div className="glass-card p-4 mb-5 flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border-border bg-background"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-primary hover:underline whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        <Tabs defaultValue="medicines" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="medicines" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Pill className="mr-2 h-4 w-4" />
              Medicines
            </TabsTrigger>
            <TabsTrigger value="vitals" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <HeartPulse className="mr-2 h-4 w-4" />
              Vitals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medicines" className="mt-0 outline-none">
            {Object.keys(grouped).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(grouped).map(([date, items]) => (
                  <div key={date}>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                      {new Date(date + "T00:00:00").toLocaleDateString("en", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="space-y-2">
                      {items.map((log, i) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="glass-card flex items-center gap-4 p-4"
                        >
                          {log.status === "taken" ? (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10">
                              <CheckCircle2 className="h-5 w-5 text-secondary" />
                            </div>
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral/10">
                              <AlertCircle className="h-5 w-5 text-coral" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {log.medicineName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.dosage} • {formatTime(log.scheduledTime)}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${log.status === "taken"
                              ? "bg-secondary/10 text-secondary"
                              : "bg-coral/10 text-coral"
                              }`}
                          >
                            {log.status === "taken" ? "Taken" : "Missed"}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  No history yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your medicine logs will appear here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="vitals" className="mt-0 outline-none">
            {vitals.length > 0 ? (
              <div className="space-y-4">
                {vitals.map((v, i) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card flex flex-col gap-2 p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Activity className="h-4 w-4 text-purple-500" />
                        {new Date(v.date + "T00:00:00").toLocaleDateString()} at {formatTime(v.time)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {v.blood_pressure && (
                        <div className="text-sm">
                          <span className="text-muted-foreground mr-1">BP:</span>
                          <span className="font-semibold text-foreground">{v.blood_pressure}</span>
                        </div>
                      )}
                      {v.heart_rate && (
                        <div className="text-sm">
                          <span className="text-muted-foreground mr-1">HR:</span>
                          <span className="font-semibold text-foreground">{v.heart_rate} bpm</span>
                        </div>
                      )}
                      {v.temperature && (
                        <div className="text-sm">
                          <span className="text-muted-foreground mr-1">Temp:</span>
                          <span className="font-semibold text-foreground">{v.temperature}</span>
                        </div>
                      )}
                    </div>
                    {v.symptoms && (
                      <div className="mt-2 text-sm text-foreground bg-muted p-2 rounded-lg">
                        <strong>Symptoms:</strong> {v.symptoms}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <HeartPulse className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  No vitals logged
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Record your blood pressure, and heart rate to see them here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
