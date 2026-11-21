import { DoughCalculatorInputs, DoughRecipe, DoughIngredient, PizzaStyle, YeastType } from '../types';

// Conversion constants
const OUNCES_TO_GRAMS = 28.349523125; // exact: the international avoirdupois ounce
const GRAMS_TO_OUNCES = 1 / OUNCES_TO_GRAMS;

// Equal leavening power, by weight: fresh 1 : active dry 0.4 : instant 1/3.
// Source: Hamelman, "Bread" (repeated by King Arthur Pro); AVPN 2024 also gives dry = 1/3 of fresh.
const YEAST_CONVERSION_FACTORS = {
  fresh: 1,
  active_dry: 0.4,
  instant: 1 / 3
};

// Convert a baker's % of one yeast type into the equal-strength % of another, rounded to the slider step.
export const convertYeastPercent = (percent: number, from: YeastType, to: YeastType): number =>
  Math.round(percent * YEAST_CONVERSION_FACTORS[to] / YEAST_CONVERSION_FACTORS[from] * 100) / 100;

// Yeast display names for recipe output
export const YEAST_TYPE_NAMES = {
  active_dry: 'Active Dry Yeast',
  instant: 'Instant Yeast',
  fresh: 'Fresh Yeast'
};

// Convert grams to ounces
export const gramsToOunces = (grams: number): number => {
  return grams * GRAMS_TO_OUNCES;
};

// Convert ounces to grams
export const ouncesToGrams = (ounces: number): number => {
  return ounces * OUNCES_TO_GRAMS;
};

// Convert inches to cm
// Exact, with no rounding: lengths are rounded only where they are shown. Rounding here made the same
// pizza a different size after a unit switch (23 cm became 23.1 cm) and shifted ball weights by up to 0.7%.
export const inchesToCm = (inches: number): number => inches * 2.54;

// Convert cm to inches
export const cmToInches = (cm: number): number => cm / 2.54;

// Style defaults. Baker's %; yeast is instant dry. Every number sits inside the range its sources give
// (checked in accuracy.check.ts). No style adds diastatic malt or a dough enhancer: no cited formula uses an
// enhancer, and Lehmann (PMQ) finds no benefit from malt on flour that is already malted.
// `size` is the trade size in each unit: [diameter, pan width, pan length].
export const PIZZA_STYLES: PizzaStyle[] = [
  {
    id: 'neapolitan',
    name: 'Neapolitan',
    defaultHydration: 60, // AVPN 55.6-62.5%
    defaultThicknessFactor: 0.08, // 248 g ball at 30 cm; AVPN balls are 200-280 g
    preset: { salt: 2.8, yeast: 0.05, oil: 0, sugar: 0 }, // AVPN: salt 2.2-3.75%, dry yeast up to 0.06%, no fat or sugar
    size: { cm: [30, 30, 40], in: [12, 12, 16] },
    description: 'Traditional Italian style with a thin center and puffy, airy crust.'
  },
  {
    id: 'ny',
    name: 'New York',
    defaultHydration: 65, // Lehmann 58-65%
    defaultThicknessFactor: 0.1, // Lehmann's 14" recipe is 0.100; 699 g at 45 cm (sources: 635-721 g for 18")
    preset: { salt: 1.75, yeast: 0.25, oil: 2, sugar: 1.5 }, // Lehmann: salt 1.75%, IDY 0.17-0.5%, oil 1-2%, sugar optional
    size: { cm: [45, 30, 40], in: [18, 12, 16] },
    description: 'Thin, foldable slices with a crispy exterior and chewy interior.'
  },
  {
    id: 'sicilian',
    name: 'Sicilian',
    defaultHydration: 70, // Gemignani 70%, King Arthur 73.5%
    defaultThicknessFactor: 0.16, // Gemignani 990 g in 12x18" is 0.162; King Arthur 0.145, ATK 0.166
    preset: { salt: 2.2, yeast: 0.5, oil: 3.5, sugar: 0.5 }, // salt 2.0-2.22%, IDY 0.46-1.1%, oil 0-6.1%, sugar 0-0.8%
    size: { cm: [30, 30, 46], in: [12, 12, 18] },
    description: 'Thick, rectangular pizza with a fluffy, airy interior and crispy bottom.',
    isRectangular: true
  },
  {
    id: 'detroit',
    name: 'Detroit',
    defaultHydration: 68, // 64.6-80%; Modernist Pizza 70.4%
    defaultThicknessFactor: 0.13, // 500 g in 10x14" is 0.126 (Modernist Pizza, Randazzo); Lopez-Alt 0.135
    preset: { salt: 2.25, yeast: 0.5, oil: 2, sugar: 1.5 }, // oil 0-2% in most formulas; IDY 0.5% needs the cold ferment
    size: { cm: [30, 25, 36], in: [12, 10, 14] },
    description: 'Rectangular pan pizza with a thick, airy crust and crispy cheese edges.',
    isRectangular: true
  },
  {
    id: 'pan',
    name: 'Pan',
    defaultHydration: 68, // Lopez-Alt 68.75%, King Arthur 70.8%
    defaultThicknessFactor: 0.12, // Lehmann: 14 oz for a 12" pan is 0.124
    preset: { salt: 2.25, yeast: 0.6, oil: 5, sugar: 0 }, // King Arthur: IDY ~0.65% with a cold ferment; neither source adds sugar
    size: { cm: [30, 30, 40], in: [12, 12, 16] },
    description: 'Pizza Hut-style thick, fluffy crust with a crispy, oil-fried bottom baked in a deep round pan.'
  },
  {
    id: 'focaccia',
    name: 'Focaccia',
    defaultHydration: 80, // high-hydration pan focaccia: Nosrat 75%, King Arthur 79% (focaccia genovese is 50-55%)
    defaultThicknessFactor: 0.2, // King Arthur's dough in a 9x13" pan is 0.205; Nosrat 0.224
    preset: { salt: 2.5, yeast: 0.4, oil: 6, sugar: 0.5 },
    size: { cm: [30, 23, 33], in: [12, 9, 13] },
    description: 'Italian flatbread with a high hydration for an open, airy crumb.',
    isRectangular: 'both'
  }
];

// A style's trade size in the unit on screen.
export const styleSize = (styleId: string, useInches: boolean): { diameter: number; panWidth: number; panLength: number } => {
  const size = (PIZZA_STYLES.find((style) => style.id === styleId) ?? PIZZA_STYLES[0]).size;
  const [diameter, panWidth, panLength] = useInches ? size.in : size.cm;
  return { diameter, panWidth, panLength };
};

// Calculate the total dough weight
const calculateTotalDoughWeight = (numberOfPizzas: number, ballWeight: number): number => {
  return numberOfPizzas * ballWeight;
};

// Calculate thickness factor based on dough ball weight and pizza dimensions
// TF = Dough ball weight in ounces/(3.14159 × R × R), where R is the radius in inches
export const calculateThicknessFactor = (
  ballWeight: number, // in grams
  diameter: number,   // in cm or inches based on useInches
  isRectangular: boolean | 'both' = false,
  panWidth?: number,  // in cm or inches based on useInches
  panLength?: number,  // in cm or inches based on useInches
  useInches: boolean = false
): number => {
  // Convert ball weight from grams to ounces
  const ballWeightOz = gramsToOunces(ballWeight);
  
  if ((isRectangular === true || isRectangular === 'both') && panWidth && panLength) {
    // For rectangular pizzas, we use a modified formula
    // TF = Dough ball weight in ounces / (width × length)
    
    // Convert dimensions to inches if needed
    const widthInches = useInches ? panWidth : cmToInches(panWidth);
    const lengthInches = useInches ? panLength : cmToInches(panLength);
    
    const area = widthInches * lengthInches;
    return ballWeightOz / area;
  } else {
    // For round pizzas, use the standard formula
    // Convert diameter to inches if needed
    const diameterInches = useInches ? diameter : cmToInches(diameter);
    const radiusInches = diameterInches / 2;
    return ballWeightOz / (Math.PI * radiusInches * radiusInches);
  }
};

// Calculate dough ball weight based on pizza dimensions and thickness factor
export const calculateDoughBallWeight = (
  pizzaStyle: string,
  diameter: number,      // in cm or inches based on useInches
  panWidth?: number,     // in cm or inches based on useInches
  panLength?: number,    // in cm or inches based on useInches
  thicknessFactor: number = 0.1,
  useInches: boolean = false
): number => {
  const selectedStyle = PIZZA_STYLES.find(style => style.id === pizzaStyle);
  const isRectangular = selectedStyle?.isRectangular;
  
  if ((isRectangular === true || isRectangular === 'both') && panWidth && panLength) {
    // For rectangular pizzas
    // Convert dimensions to inches if needed
    const widthInches = useInches ? panWidth : cmToInches(panWidth);
    const lengthInches = useInches ? panLength : cmToInches(panLength);
    
    const area = widthInches * lengthInches;
    
    // Calculate weight in ounces then convert to grams
    const weightOz = thicknessFactor * area;
    return Math.round(ouncesToGrams(weightOz));
  } else {
    // For round pizzas
    // Convert diameter to inches if needed
    const diameterInches = useInches ? diameter : cmToInches(diameter);
    const radiusInches = diameterInches / 2;
    const area = Math.PI * radiusInches * radiusInches;
    
    // Calculate weight in ounces then convert to grams
    const weightOz = thicknessFactor * area;
    return Math.round(ouncesToGrams(weightOz));
  }
};

// Calculate flour weight based on total dough weight and baker's percentages
const calculateFlourWeight = (
  totalDoughWeight: number,
  hydration: number,
  salt: number,
  yeast: number,
  oil: number,
  sugar: number,
  diastaticMalt: number,
  doughEnhancer: number
): number => {
  // Convert percentages to decimals
  const hydrationDecimal = hydration / 100;
  const saltDecimal = salt / 100;
  const yeastDecimal = yeast / 100;
  const oilDecimal = oil / 100;
  const sugarDecimal = sugar / 100;
  const diastaticMaltDecimal = diastaticMalt / 100;
  const doughEnhancerDecimal = doughEnhancer / 100;

  // Calculate flour weight using baker's percentage formula
  // Flour is always 100%, so we divide by the sum of all percentages
  return totalDoughWeight / (1 + hydrationDecimal + saltDecimal + yeastDecimal + oilDecimal + sugarDecimal + diastaticMaltDecimal + doughEnhancerDecimal);
};

// Calculate preferment amounts
const calculatePreferment = (
  flourWeight: number,
  prefermentPercentage: number,
  prefermentHydration: number,
  yeastType: YeastType
) => {
  const prefermentFlour = (flourWeight * prefermentPercentage) / 100;
  const prefermentWater = (prefermentFlour * prefermentHydration) / 100;

  // Poolish and biga: 0.1% instant yeast on the preferment's own flour, the amount for about 12 hours at
  // room temperature (King Arthur Pro: "as little as 0.1% of the biga flour"; Modernist Bread: 0.1-0.2% for 12 h).
  const prefermentYeast = prefermentFlour * 0.001 * YEAST_CONVERSION_FACTORS[yeastType] / YEAST_CONVERSION_FACTORS.instant;

  return {
    flour: prefermentFlour,
    water: prefermentWater,
    yeast: prefermentYeast
  };
};

// Calculate the main dough ingredients
export const calculateDoughRecipe = (inputs: DoughCalculatorInputs): DoughRecipe => {
  const {
    numberOfPizzas,
    ballWeight,
    pizzaStyle,
    hydration,
    salt,
    yeast,
    yeastType,
    oil,
    sugar,
    diastaticMalt,
    doughEnhancer,
    thicknessFactor,
    pizzaDiameter,
    panWidth,
    panLength,
    preferment,
    useInches,
    isRectangular: isRect
  } = inputs;

  // Calculate total dough weight
  const totalDoughWeight = calculateTotalDoughWeight(numberOfPizzas, ballWeight);

  // Calculate flour weight
  const totalFlour = calculateFlourWeight(totalDoughWeight, hydration, salt, yeast, oil, sugar, diastaticMalt, doughEnhancer);

  // Calculate ingredient weights
  const waterWeight = (totalFlour * hydration) / 100;
  const saltWeight = (totalFlour * salt) / 100;

  // The yeast % is an amount of the selected yeast type: what the slider says is what gets weighed.
  const yeastWeight = (totalFlour * yeast) / 100;

  const oilWeight = (totalFlour * oil) / 100;
  const sugarWeight = (totalFlour * sugar) / 100;
  const diastaticMaltWeight = (totalFlour * diastaticMalt) / 100;
  const doughEnhancerWeight = (totalFlour * doughEnhancer) / 100;

  // Use the user's actual shape choice from inputs, not the style definition
  // This ensures that when a 'both' style (like Focaccia) is set to round, we use round calculation
  const selectedStyle = PIZZA_STYLES.find(style => style.id === pizzaStyle);
  const isRectangular = isRect !== undefined ? isRect : selectedStyle?.isRectangular;

  // Calculate pizza area
  let area: number;
  if (isRectangular && panWidth && panLength) {
    // If dimensions are in inches, convert to cm for area calculation in cm²
    const widthCm = useInches ? inchesToCm(panWidth) : panWidth;
    const lengthCm = useInches ? inchesToCm(panLength) : panLength;
    area = widthCm * lengthCm;
  } else {
    // If diameter is in inches, convert to cm for area calculation in cm²
    const diameterCm = useInches ? inchesToCm(pizzaDiameter) : pizzaDiameter;
    const radius = diameterCm / 2;
    area = Math.PI * radius * radius;
  }

  // Initialize ingredients array
  const ingredients: DoughIngredient[] = [
    {
      name: 'Flour',
      weight: totalFlour,
      percentage: 100,
      unit: 'g'
    },
    {
      name: 'Water',
      weight: waterWeight,
      percentage: hydration,
      unit: 'g'
    },
    {
      name: 'Salt',
      weight: saltWeight,
      percentage: salt,
      unit: 'g'
    },
    {
      name: YEAST_TYPE_NAMES[yeastType],
      weight: yeastWeight,
      percentage: yeast,
      unit: 'g'
    }
  ];

  // Add optional ingredients if they exist
  if (oil > 0) {
    ingredients.push({
      name: 'Oil',
      weight: oilWeight,
      percentage: oil,
      unit: 'g'
    });
  }

  if (sugar > 0) {
    ingredients.push({
      name: 'Sugar',
      weight: sugarWeight,
      percentage: sugar,
      unit: 'g'
    });
  }

  if (diastaticMalt > 0) {
    ingredients.push({
      name: 'Diastatic Malt',
      weight: diastaticMaltWeight,
      percentage: diastaticMalt,
      unit: 'g'
    });
  }

  if (doughEnhancer > 0) {
    ingredients.push({
      name: 'Dough Enhancer',
      weight: doughEnhancerWeight,
      percentage: doughEnhancer,
      unit: 'g'
    });
  }

  // Base recipe without preferment
  const recipe: DoughRecipe = {
    totalFlour,
    ingredients,
    pizzaInfo: {
      thicknessFactor,
      area,
      useInches,
      ...(isRectangular && panWidth && panLength 
        ? { panWidth: useInches ? inchesToCm(panWidth) : panWidth, 
            panLength: useInches ? inchesToCm(panLength) : panLength } 
        : { diameter: useInches ? inchesToCm(pizzaDiameter) : pizzaDiameter })
    }
  };

  // If using a preferment, calculate the preferment and main dough
  if (preferment.type !== 'none' && preferment.percentage > 0) {
    const { flour: prefermentFlour, water: prefermentWater, yeast: basePrefermentYeast } = calculatePreferment(
      totalFlour,
      preferment.percentage,
      preferment.hydration,
      yeastType
    );

    // Sourdough takes no commercial yeast. A sponge takes all of it (sponge-and-dough method, BAKERpedia).
    // Poolish and biga never take more than the recipe total, so the two stages always add up to the ingredient list.
    const prefermentYeast = preferment.type === 'sourdough' ? 0
      : preferment.type === 'sponge' ? yeastWeight
      : Math.min(basePrefermentYeast, yeastWeight);

    // Add preferment type to the recipe
    recipe.prefermentType = preferment.type;

    // Calculate main dough ingredients
    const mainDoughFlour = totalFlour - prefermentFlour;
    const mainDoughWater = waterWeight - prefermentWater;
    const mainDoughYeast = yeastWeight - prefermentYeast;

    recipe.preferment = {
      flour: prefermentFlour,
      water: prefermentWater,
      yeast: preferment.type !== 'sourdough' ? prefermentYeast : undefined
    };

    recipe.mainDough = {
      flour: mainDoughFlour,
      water: mainDoughWater,
      salt: saltWeight,
      yeast: mainDoughYeast,
      oil: oilWeight > 0 ? oilWeight : undefined,
      sugar: sugarWeight > 0 ? sugarWeight : undefined,
      diastaticMalt: diastaticMaltWeight > 0 ? diastaticMaltWeight : undefined,
      doughEnhancer: doughEnhancerWeight > 0 ? doughEnhancerWeight : undefined
    };
  }

  return recipe;
};

// Round to 1 decimal place for display
export const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
}; 

// Round to 2 decimal places for display
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
}; 
