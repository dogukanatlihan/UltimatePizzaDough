import NumberFlow from '@number-flow/react';
import { useTranslation } from '../context/TranslationContext';
import { gramsDigits } from '../utils/format';
import { useSliding } from './motion';

// Within the 300 ms the design allows for a transition (the library's own default is 900 ms).
const ROLL = { duration: 300, easing: 'cubic-bezier(.22, 1, .36, 1)' };

interface NumProps {
  value: number;
  /** Decimals to show at most. */
  digits?: number;
  suffix?: string;
}

/** A number that rolls to its new value, except while a slider is moving: then it follows the finger. */
export function Num({ value, digits = 0, suffix }: NumProps) {
  const { language } = useTranslation();
  const sliding = useSliding();
  const rounded = Number.isFinite(value) ? +value.toFixed(digits) : 0;
  return (
    <NumberFlow
      value={rounded === 0 ? 0 : rounded} // no "-0"
      locales={language}
      format={{ maximumFractionDigits: digits, useGrouping: false }}
      suffix={suffix}
      animated={!sliding}
      transformTiming={ROLL}
      spinTiming={ROLL}
      opacityTiming={{ duration: 200, easing: 'ease-out' }}
    />
  );
}

/** A weight, rounded by the same rule as formatGrams. */
export function Grams({ g, yeast = false }: { g: number; yeast?: boolean }) {
  return <Num value={g} digits={gramsDigits(g, yeast)} suffix=" g" />;
}
