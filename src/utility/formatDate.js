export function formatDateToISO(dateString, endDate) {
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Get today's date dynamically at runtime
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  let formattedStartDate;

  // Format the start date
  if (isoRegex.test(dateString)) {
    formattedStartDate = dateString;
  } else {
    const [day, month, year] = dateString.split("/");
    formattedStartDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}`;
  }

  // If there's no endDate, return the formatted start date
  if (!endDate) {
    return formattedStartDate;
  }

  // Parse the start and end dates for comparison
  const start = new Date(formattedStartDate);
  const end = new Date(endDate);

  // Check if start date is greater than end date OR start date is today
  if (start > end || formattedStartDate === todayISO) {
    // Set start date to 5 days before end date
    const adjustedStart = new Date(end);
    adjustedStart.setDate(end.getDate() - 5);
    return adjustedStart.toISOString().split("T")[0];
  }

  return formattedStartDate;
}

export function getSixMonthsBefore(date) {
  // Convert input to Date object
  const inputDate = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(inputDate.getTime())) {
    throw new Error("Invalid date input");
  }

  // Create a new Date object to avoid mutating the input
  const resultDate = new Date(inputDate);

  // Subtract 6 months
  resultDate.setMonth(resultDate.getMonth() - 6);

  // Format to YYYY-MM-DD
  const year = resultDate.getFullYear();
  const month = String(resultDate.getMonth() + 1).padStart(2, "0");
  const day = String(resultDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDaysAgo(timestamp) {
  // Convert timestamp (milliseconds) to Date
  const inputDate = new Date(Number(timestamp));

  // Get current date
  const now = new Date();

  // Calculate difference in milliseconds
  const diffMs = now - inputDate;

  // Convert milliseconds to days
  const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return daysAgo;
}
