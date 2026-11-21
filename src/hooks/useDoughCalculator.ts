import { useState, useEffect, useRef } from 'react';
import { DoughCalculatorInputs, PrefermentType, YeastType } from '../types';
import { 
  PIZZA_STYLES, 
  calculateDoughBallWeight,
  calculateThicknessFactor,
  convertYeastPercent,
  styleSize,
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

// Every yeast % in the presets below is an instant-yeast amount. The slider % means the yeast
// type that is selected, so presets pass through fromInstant() before they reach the inputs.
const fromInstant = (percent: number, to: YeastType) => convertYeastPercent(percent, 'instant', to);

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
      trackRecipeGenerated(
        inputs.pizzaStyle,
        inputs.numberOfPizzas,
        inputs.hydration,
        inputs.preferment.type,
        inputs.salt,
        inputs.yeast,
        inputs.yeastType,
        inputs.oil,
        inputs.sugar,
        inputs.diastaticMalt,
        inputs.doughEnhancer,
        inputs.isRectangular,
        inputs.ballWeight
      );
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
    const selectedStyle = PIZZA_STYLES.find(style => style.id === styleId);

    if (selectedStyle) {
      setInputs(prev => {
        // The style's trade size in the unit on screen (an 18-inch New York pie is 18, not 17.7).
        const size = styleSize(styleId, prev.useInches);
        const isRectangular = selectedStyle.isRectangular === true || selectedStyle.isRectangular === 'both';
        return {
          ...prev,
          pizzaStyle: styleId,
          hydration: selectedStyle.defaultHydration,
          thicknessFactor: selectedStyle.defaultThicknessFactor,
          ballWeight: isRectangular
            ? calculateDoughBallWeight(styleId, 0, size.panWidth, size.panLength, selectedStyle.defaultThicknessFactor, prev.useInches)
            : calculateDoughBallWeight(styleId, size.diameter, undefined, undefined, selectedStyle.defaultThicknessFactor, prev.useInches),
          isRectangular,
          pizzaDiameter: size.diameter,
          panWidth: size.panWidth,
          panLength: size.panLength,
          numberOfPizzas: countTouched.current ? prev.numberOfPizzas : usualBatch(styleId),
          ...selectedStyle.preset,
          yeast: fromInstant(selectedStyle.preset.yeast, prev.yeastType),
          // No cited formula for these styles adds malt or an enhancer; the sliders stay for flour that needs them.
          diastaticMalt: 0,
          doughEnhancer: 0
        };
      });

      // Track the pizza style change
      trackPizzaStyleChange(styleId);
    }
  };

  // Handle shape toggle for custom style
  const handleShapeToggle = (isRectangular: boolean) => {
    setInputs(prev => {
      // Preserve all existing values
      const newInputs = { ...prev, isRectangular };
      const styleDimensions = styleSize(prev.pizzaStyle, prev.useInches);

      if (isRectangular) {
        // Set to rectangular shape with style-specific defaults
        newInputs.panWidth = prev.panWidth || styleDimensions.panWidth;
        newInputs.panLength = prev.panLength || styleDimensions.panLength;
        
        // Ensure thickness factor is not zero
        const thicknessFactor = prev.thicknessFactor || 0.08; // Default to medium thickness if zero
        
        // Recalculate ball weight
        newInputs.ballWeight = calculateDoughBallWeight(
          prev.pizzaStyle,
          0,
          newInputs.panWidth,
          newInputs.panLength,
          thicknessFactor,
          prev.useInches
        );
        
        // Ensure ball weight is not zero
        if (newInputs.ballWeight <= 0) {
          newInputs.ballWeight = prev.ballWeight || 250; // Keep previous value or use default
        }
      } else {
        // Set to round shape with style-specific default
        newInputs.pizzaDiameter = prev.pizzaDiameter || styleDimensions.diameter;
        
        // Ensure thickness factor is not zero
        const thicknessFactor = prev.thicknessFactor || 0.08; // Default to medium thickness if zero
        
        // Recalculate ball weight
        newInputs.ballWeight = calculateDoughBallWeight(
          prev.pizzaStyle,
          newInputs.pizzaDiameter,
          undefined,
          undefined,
          thicknessFactor,
          prev.useInches
        );
        
        // Ensure ball weight is not zero
        if (newInputs.ballWeight <= 0) {
          newInputs.ballWeight = prev.ballWeight || 250; // Keep previous value or use default
        }
      }
      
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

      // Recalculate ball weight based on new thickness factor
      // Use the user's actual shape choice (isRectangular state), not the style definition
      const { pizzaStyle, pizzaDiameter, panWidth, panLength, useInches, isRectangular: isRect } = newInputs;

      if (isRect && panWidth && panLength) {
        newInputs.ballWeight = calculateDoughBallWeight(
          pizzaStyle,
          pizzaDiameter,
          panWidth,
          panLength,
          factor,
          useInches
        );
      } else {
        newInputs.ballWeight = calculateDoughBallWeight(
          pizzaStyle,
          pizzaDiameter,
          undefined,
          undefined,
          factor,
          useInches
        );
      }

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
      const newInputs = {
        ...prevInputs,
        useInches
      };

      // Convert measurements if needed
      if (useInches !== prevInputs.useInches) {
        if (useInches) {
          // Convert from cm to inches
          newInputs.pizzaDiameter = cmToInches(prevInputs.pizzaDiameter);
          if (prevInputs.panWidth) newInputs.panWidth = cmToInches(prevInputs.panWidth);
          if (prevInputs.panLength) newInputs.panLength = cmToInches(prevInputs.panLength);
        } else {
          // Convert from inches to cm
          newInputs.pizzaDiameter = inchesToCm(prevInputs.pizzaDiameter);
          if (prevInputs.panWidth) newInputs.panWidth = inchesToCm(prevInputs.panWidth);
          if (prevInputs.panLength) newInputs.panLength = inchesToCm(prevInputs.panLength);
        }
      }
      
      // Track the unit change
      trackUnitChange(useInches);
      
      return newInputs;
    });
  };

  // The style's own yeast amount (used when the preferment goes back to 'none')
  const getStyleDefaultYeast = (styleId: string): number =>
    PIZZA_STYLES.find(style => style.id === styleId)?.preset.yeast ?? 0.5;

  // Style-specific preferment defaults.
  // "percentage" = % of total flour that goes into the preferment.
  // At 100%, all flour is in the preferment and only water/salt/extras are added later.
  // Traditional ranges: poolish 30-50%, biga 40-60%, sponge 50-75%, sourdough 20-35%.
  // Sponge: 60% water and 0.5% instant yeast (BAKERpedia: 58-65% water, compressed yeast from 1.5% of the flour, 2-8 h).
  const getStylePrefermentDefaults = (styleId: string, prefermentType: PrefermentType) => {
    const styleDefaults: Record<string, Record<string, { percentage: number; hydration: number; yeast: number }>> = {
      neapolitan: {
        // Neapolitan: moderate preferment to preserve delicate flavor
        poolish: { percentage: 40, hydration: 100, yeast: 0.05 },
        biga:    { percentage: 50, hydration: 60, yeast: 0.05 },
        sponge:  { percentage: 50, hydration: 60, yeast: 0.5 },
        sourdough: { percentage: 25, hydration: 100, yeast: 0 },
      },
      ny: {
        // NY: poolish or sponge for flavor complexity in a chewy crust
        poolish: { percentage: 40, hydration: 100, yeast: 0.3 },
        biga:    { percentage: 50, hydration: 60, yeast: 0.3 },
        sponge:  { percentage: 60, hydration: 60, yeast: 0.5 },
        sourdough: { percentage: 30, hydration: 100, yeast: 0 },
      },
      sicilian: {
        // Sicilian: higher preferment % for lighter, airier thick crust
        poolish: { percentage: 50, hydration: 100, yeast: 0.3 },
        biga:    { percentage: 50, hydration: 60, yeast: 0.3 },
        sponge:  { percentage: 65, hydration: 60, yeast: 0.5 },
        sourdough: { percentage: 30, hydration: 100, yeast: 0 },
      },
      detroit: {
        // Detroit: similar to Sicilian, open crumb structure
        poolish: { percentage: 45, hydration: 100, yeast: 0.3 },
        biga:    { percentage: 50, hydration: 60, yeast: 0.3 },
        sponge:  { percentage: 60, hydration: 60, yeast: 0.5 },
        sourdough: { percentage: 25, hydration: 100, yeast: 0 },
      },
      pan: {
        // Pan pizza: moderate preferment to complement the buttery, enriched dough
        poolish:   { percentage: 45, hydration: 100, yeast: 0.3 },
        biga:      { percentage: 50, hydration: 60, yeast: 0.3 },
        sponge:    { percentage: 60, hydration: 60, yeast: 0.5 },
        sourdough: { percentage: 25, hydration: 100, yeast: 0 },
      },
      focaccia: {
        // Focaccia: high preferment for maximum flavor and open crumb
        poolish: { percentage: 50, hydration: 100, yeast: 0.3 },
        biga:    { percentage: 60, hydration: 60, yeast: 0.25 },
        sponge:  { percentage: 65, hydration: 60, yeast: 0.5 },
        sourdough: { percentage: 30, hydration: 100, yeast: 0 },
      },
    };

    return styleDefaults[styleId]?.[prefermentType] || null;
  };

  // Handle preferment type change
  const handlePrefermentTypeChange = (type: PrefermentType) => {
    setInputs(prev => {
      let percentage = prev.preferment.percentage;
      let hydration = prev.preferment.hydration;
      // Instant basis, like the presets; converted back to the selected yeast type below.
      let yeast = convertYeastPercent(prev.yeast, prev.yeastType, 'instant');

      if (type === 'none') {
        percentage = 0;
        hydration = 100;
        // Reset yeast to the style-specific default, not a generic 0.5
        yeast = getStyleDefaultYeast(prev.pizzaStyle);
      } else {
        // Try style-specific defaults first
        const styleDefaults = getStylePrefermentDefaults(prev.pizzaStyle, type);
        if (styleDefaults) {
          percentage = styleDefaults.percentage;
          hydration = styleDefaults.hydration;
          yeast = styleDefaults.yeast;
        } else {
          // Generic fallbacks for custom style (standard baker ranges)
          if (type === 'poolish') {
            percentage = 40; // Standard: 30-50% of flour
            hydration = 100;
            yeast = 0.3;
          } else if (type === 'biga') {
            percentage = 50; // Standard: 40-60% of flour
            hydration = 60;
            yeast = 0.3;
          } else if (type === 'sponge') {
            percentage = 60; // Standard: 50-75% of flour
            hydration = 60;
            yeast = 0.5;
          } else if (type === 'sourdough') {
            percentage = 25; // Standard: 20-35% of flour
            hydration = 100;
            yeast = 0;
          }
        }
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