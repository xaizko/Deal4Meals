const FDC_SEARCH = "https://api.nal.usda.gov/fdc/v1/foods/search";
const FDC_FOOD = "https://api.nal.usda.gov/fdc/v1/food";
const TOP_N_RESULTS = 5;
const PROMO_WORDS =
  /\b(deal|deals|special|specials|sale|off|bogo|combo|coupon|promo|limited|today|only|reg|regular|was|now)\b/gi;

const NUTRIENT_IDS = {
kcal: 1008,
protein_g: 1003,
fat_g: 1004,
carbs_g: 1005,
sugar_g: 2000,
fiber_g: 1079,
sodium_mg: 1093,
} as const;

const DATA_TYPES = ["Survey (FNDDS)", "SR Legacy"] as const;

export type FoodDataType = (typeof DATA_TYPES)[number];

export interface FoodMatch {
  fdcId: number;
  description: string;
  dataType: FoodDataType;
  basis: "100g";
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  sugar_g: number | null;
  fiber_g: number | null;
  sodium_mg: number | null;
}

interface FdcNutrient {
  nutrientId?: number;
  value?: number;
}

interface FdcFood {
  fdcId?: number;
  description?: string;
  foodNutrients?: FdcNutrient[];
}

/**
 * Turn a posted deal title into the text USDA should search.
 * Prices, percents, and promo words are dropped. The remaining words are the query.
 */
export function dealNameToQuery(name: string): string {
  const cleaned = name
    .replace(/\$\s?\d+(?:\.\d{1,2})?/g, " ")
    .replace(/\b\d+(?:\.\d+)?\s?%/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(PROMO_WORDS, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || name.trim();
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function nutrientValue(nutrients: FdcNutrient[], id: number): number | null {
  const hit = nutrients.find((nutrient) => nutrient.nutrientId === id);
  const value = hit?.value;
  return typeof value === "number" && Number.isFinite(value) ? round1(value) : null;
}

function toMatch(food: FdcFood, dataType: FoodDataType): FoodMatch | null {
  if (typeof food.fdcId !== "number" || !food.description) return null;
  const nutrients = food.foodNutrients ?? [];
  return {
    fdcId: food.fdcId,
    description: food.description,
    dataType,
    basis: "100g",
    kcal: nutrientValue(nutrients, NUTRIENT_IDS.kcal),
    protein_g: nutrientValue(nutrients, NUTRIENT_IDS.protein_g),
    carbs_g: nutrientValue(nutrients, NUTRIENT_IDS.carbs_g),
    fat_g: nutrientValue(nutrients, NUTRIENT_IDS.fat_g),
    sugar_g: nutrientValue(nutrients, NUTRIENT_IDS.sugar_g),
    fiber_g: nutrientValue(nutrients, NUTRIENT_IDS.fiber_g),
    sodium_mg: nutrientValue(nutrients, NUTRIENT_IDS.sodium_mg),
  };
}

function overlapScore(description: string, query: string): number {
  const words = query.toLowerCase().split(" ").filter((word) => word.length > 2);
  const text = description.toLowerCase();
  return words.filter((word) => text.includes(word)).length;
}

async function searchDataType(
  query: string,
  dataType: FoodDataType,
  apiKey: string
): Promise<FoodMatch[]> {
  const url = new URL(FDC_SEARCH);
  url.searchParams.set("api_key", apiKey);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, dataType: [dataType], pageSize: 5 }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`USDA search failed with status ${response.status}`);
  }
  const body = (await response.json()) as { foods?: FdcFood[] };
  return (body.foods ?? [])
    .map((food) => toMatch(food, dataType))
    .filter((food): food is FoodMatch => food !== null);
}

/** Search USDA survey foods (restaurant and prepared dishes) with a deal title. 
 * Returns the query used and the top N results, sorted by closest fit with the query.
*/
export async function searchFoodsByDealName(dealName: string): Promise<{
  query: string;
  foods: FoodMatch[];
}> {
  const query = dealNameToQuery(dealName);
  if (!query) {
    throw new Error("Deal name is empty");
  }

  const apiKey = process.env.FDC_API_KEY;
  if (!apiKey) {
    throw new Error("FDC_API_KEY is not set");
  }

  const results = await Promise.all(
    DATA_TYPES.map(async (dataType) => {
      try {
        return await searchDataType(query, dataType, apiKey);
      } catch (err) {
        console.error(`USDA ${dataType} search failed:`, err);
        return null;
      }
    })
  );

  if (results.every((foods) => foods === null)) {
    throw new Error("USDA search failed");
  }

  const seen = new Set<number>();
  const foods = results
    .flatMap((foods) => foods ?? [])
    .filter((food) => {
      if (seen.has(food.fdcId)) return false;
      seen.add(food.fdcId);
      return true;
    })
    .sort((a, b) => overlapScore(b.description, query) - overlapScore(a.description, query))
    .slice(0, TOP_N_RESULTS);
  return { query, foods };
}

interface FoodMeasure {
  disseminationText?: string;
  portionDescription?: string;
  gramWeight?: number;
  rank?: number;
  sequenceNumber?: number;
  amount?: number;
  modifier?: string;
  measureUnitName?: string;
  measureUnit?: { name?: string };
}

interface DetailNutrient {
  nutrientId?: number;
  value?: number;
  amount?: number;
  nutrient?: { id?: number };
}

export interface UsdaFoodDetail {
  fdcId?: number;
  description?: string;
  foodNutrients?: DetailNutrient[];
  /** Bulk download name for portions. */
  foodMeasures?: FoodMeasure[];
  /** Live food-detail name for the same portions. */
  foodPortions?: FoodMeasure[];
}

export interface ServingChoice {
  label: string;
  gramWeight: number;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  sugar_g: number | null;
  fiber_g: number | null;
  sodium_mg: number | null;
}

function nutrientAmount(nutrients: DetailNutrient[], id: number): number | null {
  const hit = nutrients.find(
    (nutrient) => nutrient.nutrientId === id || nutrient.nutrient?.id === id
  );
  const value = hit?.value ?? hit?.amount;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function measureLabel(measure: FoodMeasure): string {
  const text = measure.disseminationText?.trim() || measure.portionDescription?.trim();
  if (text) return text;

  const amount = typeof measure.amount === "number" ? String(measure.amount) : "";
  const unit = measure.modifier?.trim() || measure.measureUnitName?.trim() || measure.measureUnit?.name?.trim() || "";
  return `${amount} ${unit}`.trim() || "1 serving";
}

function scaledChoice(
  label: string,
  gramWeight: number,
  per100g: Record<keyof typeof NUTRIENT_IDS, number | null>
): ServingChoice {
  const scale = (amount: number | null) =>
    amount == null ? null : round1((amount * gramWeight) / 100);

  return {
    label,
    gramWeight,
    kcal: scale(per100g.kcal),
    protein_g: scale(per100g.protein_g),
    carbs_g: scale(per100g.carbs_g),
    fat_g: scale(per100g.fat_g),
    sugar_g: scale(per100g.sugar_g),
    fiber_g: scale(per100g.fiber_g),
    sodium_mg: scale(per100g.sodium_mg),
  };
}

/** Load one USDA food, including the portions valuesPerServing scales. */
export async function getFood(fdcId: number): Promise<UsdaFoodDetail> {
  const apiKey = process.env.FDC_API_KEY;
  if (!apiKey) {
    throw new Error("FDC_API_KEY is not set");
  }

  const url = new URL(`${FDC_FOOD}/${fdcId}`);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (response.status === 404) {
    throw new Error("Food not found");
  }
  if (!response.ok) {
    throw new Error(`USDA food lookup failed with status ${response.status}`);
  }

  const food = (await response.json()) as UsdaFoodDetail;
  if (typeof food.fdcId !== "number" || !food.description) {
    throw new Error("USDA food lookup failed");
  }
  return food;
}

/**
 * Nutrients on a USDA food are per 100 g. Each entry in foodMeasures
 * (foodPortions on the live detail endpoint) is one serving the user can pick.
 * A 100 g row is included when the food has no measure of that weight.
 */
export function valuesPerServing(food: UsdaFoodDetail): ServingChoice[] {
  const nutrients = food.foodNutrients ?? [];
  const per100g = {
    kcal: nutrientAmount(nutrients, NUTRIENT_IDS.kcal),
    protein_g: nutrientAmount(nutrients, NUTRIENT_IDS.protein_g),
    fat_g: nutrientAmount(nutrients, NUTRIENT_IDS.fat_g),
    carbs_g: nutrientAmount(nutrients, NUTRIENT_IDS.carbs_g),
    sugar_g: nutrientAmount(nutrients, NUTRIENT_IDS.sugar_g),
    fiber_g: nutrientAmount(nutrients, NUTRIENT_IDS.fiber_g),
    sodium_mg: nutrientAmount(nutrients, NUTRIENT_IDS.sodium_mg),
  };

  const measures = [...(food.foodMeasures ?? []), ...(food.foodPortions ?? [])].sort(
    (a, b) => (a.rank ?? a.sequenceNumber ?? 0) - (b.rank ?? b.sequenceNumber ?? 0)
  );

  const seen = new Set<string>();
  const choices: ServingChoice[] = [];

  for (const measure of measures) {
    const gramWeight = measure.gramWeight;
    if (typeof gramWeight !== "number" || !Number.isFinite(gramWeight) || gramWeight <= 0) {
      continue;
    }

    const label = measureLabel(measure);
    const key = `${label}|${gramWeight}`;
    if (seen.has(key)) continue;
    seen.add(key);
    choices.push(scaledChoice(label, gramWeight, per100g));
  }

  if (![...seen].some((key) => key.endsWith("|100"))) {
    choices.push(scaledChoice("100 g", 100, per100g));
  }

  return choices;
}