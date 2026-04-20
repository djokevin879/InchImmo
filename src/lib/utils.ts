import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function numberToFrench(amount: number): string {
  if (amount === 0) return "zéro";

  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];

  function convert(n: number): string {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const q = Math.floor(n / 10);
      const r = n % 10;
      if (r === 0) return tens[q];
      if (r === 1 && q < 8) return tens[q] + " et un";
      if (q === 7) return "soixante-" + teens[r];
      if (q === 9) return "quatre-vingt-" + teens[r];
      return tens[q] + "-" + units[r];
    }
    if (n < 1000) {
      const q = Math.floor(n / 100);
      const r = n % 100;
      let res = (q === 1 ? "" : units[q] + " ") + "cent";
      if (q > 1 && r === 0) res += "s";
      if (r > 0) res += " " + convert(r);
      return res;
    }
    if (n < 1000000) {
      const q = Math.floor(n / 1000);
      const r = n % 1000;
      let res = (q === 1 ? "" : convert(q) + " ") + "mille";
      if (r > 0) res += " " + convert(r);
      return res;
    }
    return n.toLocaleString(); // Fallback for very high numbers
  }

  return convert(amount).charAt(0).toUpperCase() + convert(amount).slice(1);
}
