    // Format time based on period
    export const formatTimeWithPeriod = (time: string, period: string): string => {
        const [hours, minutes] = time.split(":").map(Number);
        const isPM = period === "afternoon" || period === "evening" || hours >= 12;
        const adjustedHours = hours % 12 || 12; // Convert 0 or 24 to 12
        const periodSuffix = isPM ? "PM" : "AM";
        return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${periodSuffix}`;
      };