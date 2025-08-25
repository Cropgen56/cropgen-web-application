export function formatToYYYYMMDD(dateInput) {
  const regexDash = /^\d{4}-\d{2}-\d{2}$/;
  const regexSlash = /^\d{4}\/\d{2}\/\d{2}$/;

  // Case 1: Already yyyy-mm-dd → return as is
  if (typeof dateInput === "string" && regexDash.test(dateInput)) {
    return dateInput;
  }

  // Case 2: yyyy/mm/dd → convert manually
  if (typeof dateInput === "string" && regexSlash.test(dateInput)) {
    const [year, month, day] = dateInput.split("/");
    return `${year}-${month}-${day}`;
  }

  // Case 3: Fallback → try native Date parsing
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  // Normalize to yyyy-mm-dd
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
