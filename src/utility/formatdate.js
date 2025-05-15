export const formatDate = (inputDate) => {
  try {
    // Check if input is a string and matches DD/MM/YYYY format
    if (
      typeof inputDate !== "string" ||
      !/^\d{2}\/\d{2}\/\d{4}$/.test(inputDate)
    ) {
      throw new Error(
        "Invalid date format. Expected DD/MM/YYYY (e.g., 24/04/2025)."
      );
    }

    // Split the date into day, month, year
    const [day, month, year] = inputDate.split("/").map(Number);

    // Validate day, month, year
    if (month < 1 || month > 12) {
      throw new Error("Invalid month. Must be between 01 and 12.");
    }
    if (day < 1 || day > 31) {
      throw new Error("Invalid day. Must be between 01 and 31.");
    }
    if (year < 1000 || year > 9999) {
      throw new Error("Invalid year. Must be a 4-digit number.");
    }

    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      throw new Error("Invalid date. Please check the day, month, and year.");
    }

    // Format the date as YYYY-MM-DD
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

    return formattedDate;
  } catch (error) {
    throw new Error(`Error formatting date: ${error.message}`);
  }
};
