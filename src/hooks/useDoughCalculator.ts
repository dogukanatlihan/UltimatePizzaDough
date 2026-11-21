import { useState, useEffect, useRef } from 'react';
import { DoughCalculatorInputs, PrefermentType, YeastType } from '../types';
import { 
  PIZZA_STYLES, 
  calculateDoughBallWeight,
  calculateThicknessFactor,
  convertYeastPercent,
  styleSize,
  ballWeightOf,
  cmToInches,
  inchesToCm
} from '../utils/doughCalculator';
import { 
  trackPizzaStyleChange, 
  trackPrefermentTypeChange, 
  trackYeastTypeChange, 
  trackUnitChange,
  trackReset,
  trackRecipeGenerated,
  trackShapeToggled,
  trackRecipeAdjustment
} from '../utils/analytics';
import { loadSavedInputs, saveInputs, clearSavedInputs, sameInputs } from '../utils/savedRecipe';
import { usualBatch } from '../utils/ranges';
import { applyStyle, prefermentDefaults, fromInstant } from '../utils/styleChange';

// The starting recipe is the Neapolitan preset, so the first screen and the Neapolitan card agree.
const START = PIZZA_STYLES[0];
const DEFAULT_INPUTS: DoughCalculatorInputs = {
  numberOfPizzas: 4,
  ballWeight: calculateDoughBallWeight(START.id, START.size.cm[0], undefined, undefined, START.defaultThicknessFactor),
  pizzaStyle: START.id,
  hydration: START.defaultHydration,
  ...START.preset,
  yeastType: 'instant',
  diastaticMalt: 0,
  doughEnhancer: 0,
  thicknessFactor: START.defaultThicknessFactor,
  pizzaDiameter: START.size.cm[0],
  panWidth: START.size.cm[1],
  panLength: START.size.cm[2],
  preferment: {
    type: 'none',
    percentage: 30,
    hydration: 100
  },
  useInches: false,
  isRectangular: false
};

export const useDoughCalculator = () => {
  // A returning visitor starts from the recipe they left (read once, validated in savedRecipe.ts).
  const [saved] = useState(loadSavedInputs);
  const restored = saved !== null;
  const [inputs, setInputs] = useState<DoughCalculatorInputs>(saved ?? DEFAULT_INPUTS);
  // Until the user sets the count themselves, a style change sets its usual batch. A restored count that
  // still is the style's usual batch counts as untouched, so a returning visitor does not get 4 pans.
  const countTouched = useRef(saved !== null && saved.numberOfPizzas !== usualBatch(saved.pizzaStyle));
  const mounted = useRef(false);
  // Nothing to start over from: the recipe is the starting recipe.
  const pristine = sameInputs(inputs, DEFAULT_INPUTS);

  useEffect(() => {
    // Save only after the first change: every change after mount comes from a user action,
    // so a visitor who only looks does not get a saved recipe.
    if (mounted.current) saveInputs(inputs);
    mounted.current = true;
    
    // Track recipe generation (debounced to avoid excessive events)
    const timer = setTimeout(() => {
      trackRecipeGenerated(inputs);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [inputs]);

  // Handle input changes
  const handleInputChange = (name: string, value: string | number) => {
    if (name === 'numberOfPizzas') countTouched.current = true;
    // Track significant adjustments for key parameters
    const significantParameters = ['hydration', 'salt', 'yeast', 'oil', 'sugar', 'diastaticMalt', 'doughEnhancer'];
    if (significantParameters.includes(name)) {
      const oldValue = inputs[name as keyof DoughCalculatorInputs];
      // Only track if the change is significant (more than 5% difference for percentages)
      if (typeof oldValue === 'number' && typeof value === 'number' && 
          Math.abs(oldValue - value) > (oldValue * 0.05)) {
        trackRecipeAdjustment(name, oldValue, value, inputs.pizzaStyle);
      }
    }
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., preferment.percentage)
      const [parent, child] = name.split('.');
      setInputs((prevInputs) => {
        const parentObj = prevInputs[parent as keyof DoughCalculatorInputs];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prevInputs,
            [parent]: {
              ...parentObj,
              [child]: value
            }
          };
        }
        return prevInputs;
      });
    } else {
      // Handle direct properties
      setInputs((prevInputs) => {
        const newInputs = {
          ...prevInputs,
          [name]: value
        };

        // If ballWeight changes, recalculate thickness factor
        if (name === 'ballWeight') {
          const ballWeight = Number(value);
          const { pizzaDiameter, panWidth, panLength, useInches, isRectangular: isRect } = newInputs;

          // Use the user's actual shape choice (isRectangular state), not the style definition
          if (isRect && panWidth && panLength) {
            newInputs.thicknessFactor = calculateThicknessFactor(
              ballWeight,
              pizzaDiameter,
              true,
              panWidth,
              panLength,
              useInches
            );
          } else {
            newInputs.thicknessFactor = calculateThicknessFactor(
              ballWeight,
              pizzaDiameter,
              false,
              undefined,
              undefined,
              useInches
            );
          }
        }

        return newInputs;
      });
    }
  };

  // Handle pizza style selection
  const handlePizzaStyleChange = (styleId: string) => {
    // Choosing the style that is already chosen must not wipe the user's adjustments.
    if (styleId === inputs.pizzaStyle) return;
    if (!PIZZA_STYLES.some(style => style.id === styleId)) return;

    // Until the user sets the count themselves, a style change sets the style's usual batch.
    setInputs(prev => applyStyle(prev, styleId, countTouched.current ? prev.numberOfPizzas : usualBatch(styleId)));

    // Track the pizza style change
    trackPizzaStyleChange(styleId);
  };

  // Handle shape toggle (styles that can be round or rectangular)
  const handleShapeToggle = (isRectangular: boolean) => {
    setInputs(prev => {
      const size = styleSize(prev.pizzaStyle, prev.useInches);
      // Keep the sizes the user set; a size that was never set takes the style's own.
      const newInputs = {
        ...prev,
        isRectangular,
        pizzaDiameter: prev.pizzaDiameter || size.diameter,
        panWidth: prev.panWidth || size.panWidth,
        panLength: prev.panLength || size.panLength,
        thicknessFactor: prev.thicknessFactor || 0.08
      };
      // A weight of zero would empty the recipe: keep the weight there was.
      newInputs.ballWeight = ballWeightOf(newInputs) || prev.ballWeight || 250;

      // Track shape toggle
      trackShapeToggled(isRectangular ? 'rectangular' : 'round');

      return newInputs;
    });
  };

  // Handle pizza diameter change
  const handlePizzaDiameterChange = (diameter: number) => {
    setInputs((prevInputs) => {
      const newInputs = {
        ...prevInputs,
        pizzaDiameter: diameter
      };

      // Recalculate ball weight based on new diameter and thickness factor
      const { pizzaStyle, thicknessFactor, useInches } = newInputs;
      newInputs.ballWeight = calculateDoughBallWeight(
        pizzaStyle,
        diameter,
        undefined,
        undefined,
        thicknessFactor,
        useInches
      );

      return newInputs;
    });
  };

  // Handle thickness factor change
  const handleThicknessFactorChange = (factor: number) => {
    setInputs((prevInputs) => {
      const newInputs = {
        ...prevInputs,
        thicknessFactor: factor
      };

      // Recalculate ball weight for the shape in use (the user's choice, not the style definition)
      newInputs.ballWeight = ballWeightOf(newInputs);

      return newInputs;
    });
  };

  // Handle pan dimensions change
  const handlePanDimensionsChange = (width: number, length: number) => {
    setInputs((prevInputs) => {
      const newInputs = {
        ...prevInputs,
        panWidth: width,
        panLength: length
      };

      // Recalculate ball weight based on new pan dimensions
      const { pizzaStyle, thicknessFactor, useInches } = newInputs;
      newInputs.ballWeight = calculateDoughBallWeight(
        pizzaStyle,
        0, // Not used for rectangular pizzas
        width,
        length,
        thicknessFactor,
        useInches
      );

      return newInputs;
    });
  };

  // Handle useInches toggle
  const handleUseInchesChange = (useInches: boolean) => {
    setInputs((prevInputs) => {
      // Same pizza, other unit. A size that was never set stays unset.
      const convert = useInches ? cmToInches : inchesToCm;
      const other = (length: number | undefined) => (length ? convert(length) : length);
      const newInputs = useInches === prevInputs.useInches ? prevInputs : {
        ...prevInputs,
        useInches,
        pizzaDiameter: convert(prevInputs.pizzaDiameter),
        panWidth: other(prevInputs.panWidth),
        panLength: other(prevInputs.panLength)
      };

      // Track the unit change
      trackUnitChange(useInches);
      
      return newInputs;
    });
  };

  // Handle preferment type change
  const handlePrefermentTypeChange = (type: PrefermentType) => {
    setInputs(prev => {
      let percentage = prev.preferment.percentage;
      let hydration = prev.preferment.hydration;
      // Instant basis, like the presets; converted back to the selected yeast type below.
      let yeast = convertYeastPercent(prev.yeast, prev.yeastType, 'instant');

      const defaults = prefermentDefaults(prev.pizzaStyle, type);
      if (type === 'none') {
        percentage = 0;
        hydration = 100;
        // Back to the style's own yeast amount, not a generic one
        yeast = PIZZA_STYLES.find(style => style.id === prev.pizzaStyle)?.preset.yeast ?? yeast;
      } else if (defaults) {
        ({ percentage, hydration, yeast } = defaults);
      }

      const newInputs = {
        ...prev,
        yeast: fromInstant(yeast, prev.yeastType),
        preferment: {
          type,
          percentage,
          hydration
        }
      };

      // Track the preferment type change
      trackPrefermentTypeChange(type);

      return newInputs;
    });
  };

  // Handle preferment percentage change
  const handlePrefermentPercentageChange = (percentage: number) => {
    setInputs(prev => ({
      ...prev,
      preferment: {
        ...prev.preferment,
        percentage
      }
    }));
  };

  // Handle preferment hydration change
  const handlePrefermentHydrationChange = (hydration: number) => {
    setInputs(prev => ({
      ...prev,
      preferment: {
        ...prev.preferment,
        hydration
      }
    }));
  };

  // Handle yeast type change
  const handleYeastTypeChange = (yeastType: YeastType) => {
    setInputs(prev => {
      // Same dough, different yeast: convert the % so the leavening power stays equal.
      const newInputs = {
        ...prev,
        yeast: convertYeastPercent(prev.yeast, prev.yeastType, yeastType),
        yeastType: yeastType
      };
      
      // Track the yeast type change
      trackYeastTypeChange(yeastType);
      
      return newInputs;
    });
  };

  // Start over: forget the saved recipe and go back to the defaults. Returns what was replaced, for Undo.
  const startOver = (): DoughCalculatorInputs => {
    const previous = inputs;
    countTouched.current = false;
    mounted.current = false; // the reset itself is not a recipe worth saving
    clearSavedInputs();
    setInputs({ ...DEFAULT_INPUTS }); // a new object, so the effect always runs and re-arms saving
    trackReset();
    return previous;
  };

  // Put a recipe back (Undo after Start over).
  const restore = (previous: DoughCalculatorInputs) => {
    countTouched.current = previous.numberOfPizzas !== usualBatch(previous.pizzaStyle);
    setInputs(previous);
  };

  const resetToDefaults = () => {
    startOver();
  };

  return {
    inputs,
    pristine,
    handleInputChange,
    handlePizzaStyleChange,
    handlePrefermentTypeChange,
    handlePizzaDiameterChange,
    handleThicknessFactorChange,
    handlePanDimensionsChange,
    handleUseInchesChange,
    handlePrefermentPercentageChange,
    handlePrefermentHydrationChange,
    handleYeastTypeChange,
    handleShapeToggle,
    resetToDefaults,
    restored,
    startOver,
    restore
  };
}; 