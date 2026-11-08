import { Router } from "express";
import { getFood, searchFoodsByDealName, valuesPerServing } from "../usda-db";

const router = Router();

router.get("/foods/search", async (req, res) => {
  const name = typeof req.query.name === "string" ? req.query.name.trim() : "";

  if (!name) {
    return res.status(400).json({ error: "name query parameter is required" });
  }

  try {
    const result = await searchFoodsByDealName(name);
    return res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "USDA search failed";

    if (message === "FDC_API_KEY is not set") {
      return res.status(500).json({ error: message });
    }

    console.error("USDA search failed:", err);
    
    return res.status(502).json({ error: "USDA search failed" });
  }
});

router.get("/foods/:fdcId", async (req, res) => {
  const fdcId = Number(req.params.fdcId);
  if (!Number.isInteger(fdcId) || fdcId <= 0) {
    return res.status(400).json({ error: "fdcId must be a positive integer" });
  }

  try {
    const food = await getFood(fdcId);
    return res.json({
      fdcId: food.fdcId,
      description: food.description,
      servings: valuesPerServing(food),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "USDA food lookup failed";

    if (message === "FDC_API_KEY is not set") {
      return res.status(500).json({ error: message });
    }
    if (message === "Food not found") {
      return res.status(404).json({ error: message });
    }

    console.error("USDA food lookup failed:", err);
    return res.status(502).json({ error: "USDA food lookup failed" });
  }
});

export default router;