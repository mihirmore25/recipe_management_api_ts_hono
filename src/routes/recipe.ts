import { Hono } from "hono";
import { verify } from "../middleware/verify";
import { createRecipe, deleteRecipe, getRecipe, getRecipes } from "../controllers/recipe";
const recipeRoutes = new Hono();

recipeRoutes.post("/", verify, createRecipe);
recipeRoutes.get("/", verify, getRecipes);
recipeRoutes.get("/:id", verify, getRecipe);
recipeRoutes.delete("/:id", verify, deleteRecipe);

export default recipeRoutes;
