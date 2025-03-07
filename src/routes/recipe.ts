import { Hono } from "hono";
import { verify } from "../middleware/verify";
import { createRecipe, getRecipes } from "../controllers/recipe";
const recipeRoutes = new Hono();

recipeRoutes.post("/", verify, createRecipe);
recipeRoutes.get("/", verify, getRecipes);

export default recipeRoutes;
