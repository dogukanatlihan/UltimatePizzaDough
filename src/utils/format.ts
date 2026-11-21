import { gramsToOunces } from './doughCalculator';

interface WeightOptions {
  yeast?: boolean;
  locale?: string;
}

const number = (value: number, maximumFractionDigits: number, locale = 'en'): string => {
  const out = new Intl.NumberFormat(locale, { maximumFractionDigits, useGrouping: false }).format(value);
  return /^-0([.,]0*)?$/.test(out) ? out.slice(1) : out; // a rounded-away negative reads "0", not "-0"
};

// Weights the way a kitchen scale reads: whole grams from 10 g, one decimal below, two below 1 g and for yeast.
export const gramsNumber = (g: number, { yeast = false, locale }: WeightOptions = {}): string => {
  if (!Number.isFinite(g)) return '0';
  const size = Math.abs(g);
  return number(g, yeast || size < 1 ? 2 : size < 10 ? 1 : 0, locale);
};

export const formatGrams = (g: number, opts?: WeightOptions): string => `${gramsNumber(g, opts)} g`;

export const formatOunces = (g: number, locale?: string): string => {
  const oz = Number.isFinite(g) ? gramsToOunces(g) : 0;
  return `${number(oz, Math.abs(oz) < 1 ? 2 : 1, locale)} oz`;
};
