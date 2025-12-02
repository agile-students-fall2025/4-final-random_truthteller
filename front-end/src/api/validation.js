const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

// MOCK IMPLEMENTATION
export const validateSchedule = async (
  events,
  creditMin = 12,
  creditMax = 20,
) => {
  console.log("MOCK validateSchedule", events);
  // Calculate total credits from events
  const creditTotal = events.reduce((sum, e) => sum + (e.credits || 0), 0);

  const warnings = [];
  if (creditTotal < creditMin) {
    warnings.push(`Not enough credits (have ${creditTotal}, need ${creditMin})`);
  } else if (creditTotal > creditMax) {
    warnings.push(`Too many credits (have ${creditTotal}, max ${creditMax})`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
    details: {
      creditTotal,
    },
  };
};
