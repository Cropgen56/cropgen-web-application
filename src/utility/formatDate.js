export function formatDateToISO(dateString, endDate) {
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Get today's date in ISO format
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  let formattedDate;

  // Format the input date
  if (isoRegex.test(dateString)) {
    formattedDate = dateString;
  } else {
    const [day, month, year] = dateString.split("/");
    formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // If formatted date is today, subtract 5 days from endDate
  if (formattedDate === todayISO && endDate) {
    const end = new Date(endDate);
    end.setDate(end.getDate() - 5);
    return end.toISOString().split("T")[0];
  }

  return formattedDate;
}
