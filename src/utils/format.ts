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
export const gramsDigits = (g: number, yeast = false): number => (yeast || Math.abs(g) < 1 ? 2 : Math.abs(g) < 10 ? 1 : 0);

export const gramsNumber = (g: number, { yeast = false, locale }: WeightOptions = {}): string =>
  Number.isFinite(g) ? number(g, gramsDigits(g, yeast), locale) : '0';

export const formatGrams = (g: number, opts?: WeightOptions): string => `${gramsNumber(g, opts)} g`;

export const ouncesNumber = (g: number, locale?: string): string => {
  const oz = Number.isFinite(g) ? gramsToOunces(g) : 0;
  return number(oz, Math.abs(oz) < 1 ? 2 : 1, locale);
};

export const formatOunces = (g: number, locale?: string): string => `${ouncesNumber(g, locale)} oz`;

// English writes 60%, Turkish writes %60.
export const formatPercent = (value: number, locale = 'en'): string => {
  const n = number(Number.isFinite(value) ? value : 0, 2, locale);
  return locale.startsWith('tr') ? `%${n}` : `${n}%`;
};

// Lengths: at most one decimal (inches are stored to 0.1).
export const lengthNumber = (value: number, locale?: string): string => number(value, 1, locale);
