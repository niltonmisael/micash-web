/** Brazilian mobile numbers: DDD (2 digits) + 9 digits starting with 9. Sent to the API as digits only. */

export function phoneDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  // Pasted with the country code (+55 11 98765-4321): drop the 55.
  if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
  return digits.slice(0, 11);
}

/** "11987654321" → "(11) 98765-4321", formatting while the user types. */
export function formatPhone(value: string) {
  const d = phoneDigits(value);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Valid DDDs start at 11; the mobile number has 9 digits and starts with 9. */
export function isValidMobile(value: string) {
  return /^[1-9][1-9]9\d{8}$/.test(phoneDigits(value));
}
