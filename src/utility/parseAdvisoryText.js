// In satelliteSlice.js
export const parseAdvisoryText = (text) => {
  if (typeof text !== "string") return text; // Return as-is if already parsed
  const days = text.split(/\n(?=DAY \d)/); // Split by "DAY X" headers
  const advisory = {};

  days.forEach((dayText) => {
    const lines = dayText.trim().split("\n");
    const dayMatch = lines[0].match(/DAY (\d+)/);
    if (!dayMatch) return;

    const dayKey = `Day ${dayMatch[1]}`;
    advisory[dayKey] = {
      "Disease/Pest Control": "",
      Fertigation: "",
      Watering: "",
      Monitoring: "",
    };

    lines.slice(1).forEach((line) => {
      if (line.startsWith("Disease Pest -")) {
        advisory[dayKey]["Disease/Pest Control"] = line.replace(
          "Disease Pest - ",
          ""
        );
      } else if (line.startsWith("Spray -")) {
        advisory[dayKey]["Disease/Pest Control"] += `\n${line
          .replace("Spray - ", "")
          .replace(/^\[|\]$/g, "")}`;
      } else if (line.startsWith("Fertigation -")) {
        advisory[dayKey]["Fertigation"] = line
          .replace("Fertigation - ", "")
          .replace(/^\[|\]$/g, "");
      } else if (line.startsWith("Water -")) {
        advisory[dayKey]["Watering"] = line
          .replace("Water - ", "")
          .replace(/^\[|\]$/g, "");
      } else if (line.startsWith("Monitoring -")) {
        advisory[dayKey]["Monitoring"] = line
          .replace("Monitoring - ", "")
          .replace(/^\[|\]$/g, "");
      }
    });
  });

  return advisory;
};
