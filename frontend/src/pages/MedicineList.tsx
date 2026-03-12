import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Pill, PlusCircle, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMedicines } from "@/hooks/useMedicines";
import MedicineCard from "@/components/MedicineCard";
import { toast } from "sonner";

export default function MedicineList() {
  const { medicines, deleteMedicine } = useMedicines();
  const [search, setSearch] = useState("");

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    deleteMedicine(id);
    toast.success(`${name} removed`);
  };

  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">My Medicines</h1>
            <p className="text-sm text-muted-foreground">{medicines.length} medicine(s) added</p>
          </div>
          <Link to="/add">
            <Button className="rounded-xl gradient-hero text-primary-foreground border-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </Link>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicines..."
            className="rounded-xl pl-10 border-border bg-card"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((med, i) => (
              <MedicineCard
                key={med.id}
                medicine={med}
                index={i}
                onDelete={() => handleDelete(med.id, med.name)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Pill className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {search ? "No matches found" : "No medicines yet"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try a different search term" : "Add your first medicine to get started"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
