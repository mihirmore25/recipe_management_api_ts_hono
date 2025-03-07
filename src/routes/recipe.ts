import { Hono } from "hono";
import { verify } from "../middleware/verify";
import { createRecipe, getRecipe, getRecipes } from "../controllers/recipe";
const recipeRoutes = new Hono();

recipeRoutes.post("/", verify, createRecipe);
recipeRoutes.get("/", verify, getRecipes);
recipeRoutes.get("/:id", verify, getRecipe);

export default recipeRoutes;
