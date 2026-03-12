export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: "once" | "twice" | "thrice" | "custom";
  times: string[];
  startDate: string;
  endDate: string;
  notes: string;
  status: "upcoming" | "taken" | "missed";
  inventory?: number;
  dependentName?: string;
}

export interface MedicineLog {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  date: string;
  status: "taken" | "missed" | "snoozed";
  takenAt?: string;
}

export const PREDEFINED_MEDICINES = [
  "Paracetamol", "Ibuprofen", "Amoxicillin", "Cetirizine", "Metformin",
  "Omeprazole", "Atorvastatin", "Amlodipine", "Losartan", "Aspirin",
  "Azithromycin", "Ciprofloxacin", "Diclofenac", "Doxycycline", "Gabapentin",
  "Hydrochlorothiazide", "Levothyroxine", "Lisinopril", "Metoprolol",
  "Montelukast", "Pantoprazole", "Prednisone", "Ranitidine", "Sertraline",
  "Simvastatin", "Tramadol", "Vitamin D3", "Vitamin B12", "Vitamin C",
  "Calcium + D3", "Iron Supplement", "Folic Acid", "Zinc Supplement",
  "Multivitamin", "Cough Syrup", "Antacid Gel",
];

export const FREQUENCY_OPTIONS = [
  { value: "once", label: "Once Daily", times: 1 },
  { value: "twice", label: "Twice Daily", times: 2 },
  { value: "thrice", label: "Thrice Daily", times: 3 },
  { value: "custom", label: "Custom", times: 0 },
] as const;

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function isTimeNow(time: string): boolean {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  return now.getHours() === h && now.getMinutes() === m;
}

export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}
