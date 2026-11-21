import { DoughCalculatorInputs, DoughRecipe, DoughIngredient, PizzaStyle, PrefermentType, YeastType } from '../types';

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

/** The dough weight for the shape and size in use: the pan when the shape is rectangular, the diameter when round. */
export const ballWeightOf = (
  i: Pick<DoughCalculatorInputs, 'pizzaStyle' | 'pizzaDiameter' | 'panWidth' | 'panLength' | 'thicknessFactor' | 'useInches' | 'isRectangular'>
): number =>
  i.isRectangular && i.panWidth && i.panLength
    ? calculateDoughBallWeight(i.pizzaStyle, 0, i.panWidth, i.panLength, i.thicknessFactor, i.useInches)
    : calculateDoughBallWeight(i.pizzaStyle, i.pizzaDiameter, undefined, undefined, i.thicknessFactor, i.useInches);

// The shape in use, in cm. The user's choice wins over the style, so a focaccia set to round is round.
const pizzaShape = ({ pizzaStyle, pizzaDiameter, panWidth, panLength, useInches, isRectangular }: DoughCalculatorInputs) => {
  const cm = (length: number) => (useInches ? inchesToCm(length) : length);
  const rectangular = isRectangular ?? PIZZA_STYLES.find(style => style.id === pizzaStyle)?.isRectangular;
  if (rectangular && panWidth && panLength) {
    return { area: cm(panWidth) * cm(panLength), panWidth: cm(panWidth), panLength: cm(panLength) };
  }
  const diameter = cm(pizzaDiameter);
  return { area: Math.PI * (diameter / 2) ** 2, diameter };
};

// Yeast for the first stage.
const prefermentYeast = (type: PrefermentType, prefermentFlour: number, totalYeast: number, yeastType: YeastType): number => {
  // Sourdough takes no commercial yeast. A sponge takes all of it (sponge-and-dough method, BAKERpedia).
  if (type === 'sourdough') return 0;
  if (type === 'sponge') return totalYeast;
  // Poolish and biga: 0.1% instant yeast on the preferment's own flour, the amount for about 12 hours at
  // room temperature (King Arthur Pro: "as little as 0.1% of the biga flour"; Modernist Bread: 0.1-0.2% for 12 h).
  // Never more than the recipe total, so the two stages always add up to the ingredient list.
  return Math.min(prefermentFlour * 0.001 * YEAST_CONVERSION_FACTORS[yeastType] / YEAST_CONVERSION_FACTORS.instant, totalYeast);
};

// The two stages of a dough made with a preferment.
const splitStages = (inputs: DoughCalculatorInputs, totalFlour: number): Pick<DoughRecipe, 'prefermentType' | 'preferment' | 'mainDough'> => {
  const { preferment, yeastType } = inputs;
  const grams = (percentage: number) => (totalFlour * percentage) / 100;
  const whenUsed = (percentage: number) => (percentage > 0 ? grams(percentage) : undefined);
  const flour = grams(preferment.percentage);
  const water = (flour * preferment.hydration) / 100;
  const yeast = prefermentYeast(preferment.type, flour, grams(inputs.yeast), yeastType);
  return {
    prefermentType: preferment.type,
    preferment: { flour, water, yeast: preferment.type === 'sourdough' ? undefined : yeast },
    mainDough: {
      flour: totalFlour - flour,
      water: grams(inputs.hydration) - water,
      salt: grams(inputs.salt),
      yeast: grams(inputs.yeast) - yeast,
      oil: whenUsed(inputs.oil),
      sugar: whenUsed(inputs.sugar),
      diastaticMalt: whenUsed(inputs.diastaticMalt),
      doughEnhancer: whenUsed(inputs.doughEnhancer)
    }
  };
};

// Calculate the main dough ingredients
export const calculateDoughRecipe = (inputs: DoughCalculatorInputs): DoughRecipe => {
  const { numberOfPizzas, ballWeight, hydration, salt, yeast, yeastType, oil, sugar, diastaticMalt, doughEnhancer, thicknessFactor, preferment, useInches } = inputs;

  // Baker's percentages: flour is 100%, so the dough weighs flour x (1 + the sum of every other percentage).
  const totalFlour = (numberOfPizzas * ballWeight) / (1 + (hydration + salt + yeast + oil + sugar + diastaticMalt + doughEnhancer) / 100);
  const ingredient = (name: string, percentage: number): DoughIngredient => ({ name, weight: (totalFlour * percentage) / 100, percentage, unit: 'g' });

  const recipe: DoughRecipe = {
    totalFlour,
    ingredients: [
      { ...ingredient('Flour', 100), weight: totalFlour },
      ingredient('Water', hydration),
      ingredient('Salt', salt),
      // The yeast % is an amount of the selected yeast type: what the slider says is what gets weighed.
      ingredient(YEAST_TYPE_NAMES[yeastType], yeast),
      // Optional ingredients appear only when they are used.
      ...[ingredient('Oil', oil), ingredient('Sugar', sugar), ingredient('Diastatic Malt', diastaticMalt), ingredient('Dough Enhancer', doughEnhancer)]
        .filter(row => row.percentage > 0)
    ],
    pizzaInfo: { thicknessFactor, useInches, ...pizzaShape(inputs) }
  };

  if (preferment.type !== 'none' && preferment.percentage > 0) Object.assign(recipe, splitStages(inputs, totalFlour));
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
