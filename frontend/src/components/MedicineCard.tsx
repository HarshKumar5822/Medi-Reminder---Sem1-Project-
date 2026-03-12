import { motion } from "framer-motion";
import { Pill, Clock, Trash2, Edit, CheckCircle2, AlertCircle, Timer, User as UserIcon, AlertTriangle, RefreshCcw } from "lucide-react";
import { Medicine, formatTime } from "@/lib/medicines";
import { Button } from "@/components/ui/button";
import { useMedicinesContext } from "@/context/MedicinesContext";
import { toast } from "sonner";

interface Props {
  medicine: Medicine;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

const statusConfig = {
  taken: { icon: CheckCircle2, label: "Taken", className: "text-secondary bg-secondary/10" },
  missed: { icon: AlertCircle, label: "Missed", className: "text-coral bg-coral/10" },
  upcoming: { icon: Timer, label: "Upcoming", className: "text-primary bg-primary/10" },
};

export default function MedicineCard({ medicine, onEdit, onDelete, index = 0 }: Props) {
  const status = statusConfig[medicine.status];
  const StatusIcon = status.icon;
  const { refillMedicine } = useMedicinesContext();

  const handleRefill = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click events
    await refillMedicine(medicine.id, 30); // Default refill amount is 30
    toast.success(`Refilled ${medicine.name} with 30 doses.`);
  };

  const isLowInventory = medicine.inventory !== undefined && medicine.inventory < 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card p-5 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              {medicine.name}
              {medicine.dependentName && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  <UserIcon className="h-3 w-3" />
                  {medicine.dependentName}
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>

          {medicine.inventory !== undefined && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${isLowInventory ? 'border-destructive text-destructive bg-destructive/10' : 'border-border text-muted-foreground bg-muted/50'}`}>
              {isLowInventory && <AlertTriangle className="h-3 w-3" />}
              {medicine.inventory} left
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {medicine.times.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground"
          >
            <Clock className="h-3 w-3" />
            {formatTime(t)}
          </span>
        ))}
      </div>

      {(onEdit || onDelete || isLowInventory) && (
        <div className="mt-4 flex gap-2 border-t border-border/50 pt-3">
          {isLowInventory && (
            <Button variant="outline" size="sm" onClick={handleRefill} className="text-primary border-primary/30 rounded-lg hover:bg-primary/10">
              <RefreshCcw className="mr-1 h-3.5 w-3.5" />
              Refill
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit} className="text-muted-foreground rounded-lg ml-auto">
              <Edit className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive rounded-lg">
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
