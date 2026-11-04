import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** clsx + tailwind-merge: a class passed by the caller (e.g. "h-12") replaces the component default ("h-14"). */
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}
