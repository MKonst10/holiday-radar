export const createShareMessage = (holiday) => {
  const holidayDate = new Date(holiday.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  holidayDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formattedDate = holidayDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const relative = rtf.format(diffDays, "day");

  const title = diffDays === 0 ? "`🎉 Happy Holiday!" : "📅 Upcoming Holiday:";

  const text =
    diffDays === 0
      ? `Today is "${holiday.localName}" (${holiday.name})! 🎊`
      : `"${holiday.localName}" (${holiday.name}) is ${relative} – on ${formattedDate}.`;

  return { title, text };
};
