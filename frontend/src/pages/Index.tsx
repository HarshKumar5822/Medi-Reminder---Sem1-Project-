import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Pill,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getGreeting, formatTime } from "@/lib/medicines";
import { useMedicines } from "@/hooks/useMedicines";
import AdherenceChart from "@/components/AdherenceChart";
import MedicineCard from "@/components/MedicineCard";

export default function Dashboard() {
  const { todayMedicines, getAdherenceData, getAdherencePercentage } = useMedicines();
  const adherence = getAdherencePercentage();
  const chartData = getAdherenceData();

  return (
    <div className="space-y-6 pb-8">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero rounded-3xl p-6 sm:p-8 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/20" />
          <div className="absolute -left-5 -bottom-5 h-28 w-28 rounded-full bg-primary-foreground/10" />
        </div>
        <div className="relative">
          <p className="text-sm opacity-90">
            {new Date().toLocaleDateString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1">
            {getGreeting()}, Harshu 👋
          </h1>
          <p className="mt-2 text-sm opacity-80">
            {todayMedicines.length > 0
              ? `You have ${todayMedicines.length} medicine${todayMedicines.length > 1 ? "s" : ""} scheduled today`
              : "No medicines scheduled for today"}
          </p>
          <Link to="/add">
            <Button className="mt-4 rounded-xl bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/30 border backdrop-blur-sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Quick Add Medicine
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Pill, label: "Today's Meds", value: todayMedicines.length, color: "primary" },
          { icon: TrendingUp, label: "Adherence", value: `${adherence}%`, color: "secondary" },
          { icon: Clock, label: "Upcoming", value: todayMedicines.filter(m => m.status === "upcoming").length, color: "amber" },
          { icon: Activity, label: "Active", value: todayMedicines.length, color: "mint" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-4"
          >
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-${color}/10`}>
              <Icon className={`h-4 w-4 text-${color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly adherence */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Weekly Progress
              </h3>
              <span className="text-2xl font-bold text-secondary">{adherence}%</span>
            </div>
            <Progress value={adherence} className="h-3 rounded-full" />
            <p className="mt-2 text-xs text-muted-foreground">
              {adherence >= 80
                ? "Great job! Keep it up! 🎉"
                : adherence >= 50
                ? "Good progress, stay consistent! 💪"
                : "Let's improve your adherence! 🌟"}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <AdherenceChart data={chartData} />
        </motion.div>
      </div>

      {/* Today's medicines */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-foreground">
            Today's Medicines
          </h2>
          <Link
            to="/medicines"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {todayMedicines.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {todayMedicines.map((med, i) => (
              <MedicineCard key={med.id} medicine={med} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Pill className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              No medicines today
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first medicine to get started
            </p>
            <Link to="/add">
              <Button className="mt-4 rounded-xl gradient-hero text-primary-foreground border-0">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
