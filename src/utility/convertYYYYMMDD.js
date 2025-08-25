export function formatToYYYYMMDD(dateInput) {
  // Regex to check if the input is already in yyyy-mm-dd format
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (regex.test(dateInput)) {
    return dateInput;
  }

  // Try to parse the input as a Date
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  // Convert to yyyy-mm-dd
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
