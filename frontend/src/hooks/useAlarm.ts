import { useState, useEffect, useCallback, useRef } from "react";
import { Medicine, isTimeNow, getTodayStr } from "@/lib/medicines";

export interface AlarmState {
  isActive: boolean;
  medicine: Medicine | null;
  time: string;
}

export function useAlarm(medicines: Medicine[]) {
  const [alarm, setAlarm] = useState<AlarmState>({
    isActive: false,
    medicine: null,
    time: "",
  });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkedTimesRef = useRef<Set<string>>(new Set());

  // Reset checked times at midnight
  useEffect(() => {
    const midnight = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        checkedTimesRef.current.clear();
      }
    }, 60000);
    return () => clearInterval(midnight);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (alarm.isActive) return;
      const today = getTodayStr();

      for (const med of medicines) {
        if (med.startDate > today || med.endDate < today) continue;
        for (const time of med.times) {
          const key = `${med.id}-${time}-${today}`;
          if (checkedTimesRef.current.has(key)) continue;
          if (isTimeNow(time)) {
            checkedTimesRef.current.add(key);
            triggerAlarm(med, time);
            return;
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [medicines, alarm.isActive]);

  const triggerAlarm = useCallback((medicine: Medicine, time: string) => {
    setAlarm({ isActive: true, medicine, time });

    // Play loud, continuous alarm sound using Web Audio API
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }

      const playAlarmPattern = () => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        if (ctx.state === 'suspended') ctx.resume();

        const playBeep = (startTime: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.frequency.setValueAtTime(800, startTime); // High pitch alarm tone
          osc.type = "square"; // Loud, harsh waveform

          gain.gain.setValueAtTime(0, startTime);
          // Quick attack, sustain, quick release for a sharp "beep"
          gain.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
          gain.gain.setValueAtTime(0.5, startTime + 0.15);
          gain.gain.linearRampToValueAtTime(0, startTime + 0.2);

          osc.start(startTime);
          osc.stop(startTime + 0.25);
        };

        const now = ctx.currentTime;
        // 4 rapid beeps standard alarm clock pattern
        playBeep(now);
        playBeep(now + 0.25);
        playBeep(now + 0.50);
        playBeep(now + 0.75);
      };

      // Play immediately, then loop every 2 seconds
      playAlarmPattern();
      alarmIntervalRef.current = setInterval(playAlarmPattern, 2000);

    } catch (e) {
      console.log("Audio not available");
    }

    // Browser notification (persistent if supported)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💊 Medicine Reminder", {
        body: `Time to take ${medicine.name} (${medicine.dosage})`,
        icon: "/favicon.ico",
        requireInteraction: true,
      });
    }
  }, []);

  const dismissAlarm = useCallback(() => {
    setAlarm({ isActive: false, medicine: null, time: "" });

    // Stop audio
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().then(() => {
        audioCtxRef.current = null;
      });
    }
  }, []);

  const snoozeAlarm = useCallback(() => {
    const med = alarm.medicine;
    const time = alarm.time;
    dismissAlarm();
    if (med) {
      setTimeout(() => triggerAlarm(med, time), 5 * 60 * 1000);
    }
  }, [alarm, dismissAlarm, triggerAlarm]);

  const requestNotificationPermission = useCallback(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return { alarm, dismissAlarm, snoozeAlarm, requestNotificationPermission };
}
