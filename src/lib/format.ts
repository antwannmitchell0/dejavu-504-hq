import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

export function parseDate(value: string) {
  const d = parseISO(value);
  return isValid(d) ? d : new Date(value);
}

export function formatDate(value: string, pattern = "MMM d") {
  return format(parseDate(value), pattern);
}

export function formatDateTime(value: string) {
  return format(parseDate(value), "EEE, MMM d · h:mm a");
}

export function fromNow(value: string) {
  return formatDistanceToNow(parseDate(value), { addSuffix: true });
}

export function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function compact(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function fullName(first: string, last: string) {
  return [first, last].filter(Boolean).join(" ");
}

export function phonePretty(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}
