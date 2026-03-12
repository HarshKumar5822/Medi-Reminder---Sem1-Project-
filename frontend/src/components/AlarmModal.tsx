import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Clock } from "lucide-react";
import { AlarmState } from "@/hooks/useAlarm";
import { formatTime } from "@/lib/medicines";
import { Button } from "@/components/ui/button";

interface Props {
  alarm: AlarmState;
  onTaken: () => void;
  onSnooze: () => void;
}

export default function AlarmModal({ alarm, onTaken, onSnooze }: Props) {
  return (
    <AnimatePresence>
      {alarm.isActive && alarm.medicine && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl bg-card p-8 text-center"
            style={{ boxShadow: "var(--shadow-card-hover)" }}
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-10 w-10 text-primary animate-ring-alarm" />
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-1">
              Medicine Reminder
            </h2>
            <p className="text-muted-foreground mb-6">
              It's time to take your medicine
            </p>

            <div className="mb-6 rounded-2xl bg-muted p-4">
              <p className="font-display text-lg font-semibold text-foreground">
                {alarm.medicine.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {alarm.medicine.dosage} • {formatTime(alarm.time)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onSnooze}
                variant="outline"
                className="flex-1 rounded-xl py-5"
              >
                <Clock className="mr-2 h-4 w-4" />
                Snooze 5m
              </Button>
              <Button
                onClick={onTaken}
                className="flex-1 rounded-xl py-5 gradient-hero text-primary-foreground border-0"
              >
                <Check className="mr-2 h-4 w-4" />
                Taken
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
