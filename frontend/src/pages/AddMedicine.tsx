import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pill, Plus, X, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PREDEFINED_MEDICINES, FREQUENCY_OPTIONS, getTodayStr } from "@/lib/medicines";
import { useMedicines } from "@/hooks/useMedicines";
import { toast } from "sonner";

export default function AddMedicine() {
  const navigate = useNavigate();
  const { addMedicine } = useMedicines();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<"once" | "twice" | "thrice" | "custom">("once");
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [inventory, setInventory] = useState<number>(30);
  const [dependentName, setDependentName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (name.length < 1) return [];
    return PREDEFINED_MEDICINES.filter((m) =>
      m.toLowerCase().includes(name.toLowerCase())
    ).slice(0, 6);
  }, [name]);

  const handleFrequencyChange = (f: typeof frequency) => {
    setFrequency(f);
    const opt = FREQUENCY_OPTIONS.find((o) => o.value === f);
    if (opt && opt.times > 0) {
      const defaults = ["08:00", "14:00", "20:00"];
      setTimes(defaults.slice(0, opt.times));
    }
  };

  const addTimeSlot = () => setTimes((prev) => [...prev, "12:00"]);
  const removeTimeSlot = (i: number) => setTimes((prev) => prev.filter((_, idx) => idx !== i));
  const updateTime = (i: number, val: string) =>
    setTimes((prev) => prev.map((t, idx) => (idx === i ? val : t)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    addMedicine({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times,
      startDate,
      endDate,
      notes: notes.trim(),
      inventory,
      dependentName: dependentName.trim() || undefined,
    });
    toast.success(`${name} added successfully! 💊`);
    navigate("/medicines");
  };

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero">
            <Pill className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Add Medicine</h1>
            <p className="text-sm text-muted-foreground">Set up your medication reminder</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Medicine Name */}
          <div className="glass-card p-5 space-y-4">
            <div className="relative">
              <Label className="text-sm font-medium text-foreground">Medicine Name *</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="e.g. Paracetamol"
                className="mt-1.5 rounded-xl border-border bg-background"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setName(s);
                        setShowSuggestions(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Dosage *</Label>
              <Input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg"
                className="mt-1.5 rounded-xl border-border bg-background"
              />
            </div>
          </div>

          {/* Profile & Stock details */}
          <div className="glass-card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Who is this for?</Label>
                <Input
                  value={dependentName}
                  onChange={(e) => setDependentName(e.target.value)}
                  placeholder="e.g. Mom, Son (leave blank for Self)"
                  className="mt-1.5 rounded-xl border-border bg-background"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Initial Inventory</Label>
                <Input
                  type="number"
                  min="0"
                  value={inventory}
                  onChange={(e) => setInventory(Number(e.target.value))}
                  placeholder="Total pills"
                  className="mt-1.5 rounded-xl border-border bg-background"
                />
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div className="glass-card p-5 space-y-4">
            <Label className="text-sm font-medium text-foreground">Frequency</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleFrequencyChange(opt.value as typeof frequency)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${frequency === opt.value
                      ? "gradient-hero text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Times */}
            <div>
              <Label className="text-sm font-medium text-foreground">Reminder Times</Label>
              <div className="mt-1.5 space-y-2">
                {times.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={t}
                      onChange={(e) => updateTime(i, e.target.value)}
                      className="rounded-xl border-border bg-background"
                    />
                    {times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(i)}
                        className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {frequency === "custom" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                    className="rounded-xl"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Time
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="glass-card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1.5 rounded-xl border-border bg-background"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">End Date *</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1.5 rounded-xl border-border bg-background"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take after meals, with water..."
                className="mt-1.5 rounded-xl border-border bg-background resize-none"
                rows={3}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl py-6 text-base font-semibold gradient-hero text-primary-foreground border-0"
          >
            <Pill className="mr-2 h-5 w-5" />
            Save Medicine
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
