import { Hono } from "hono";
import { verify } from "../middleware/verify";
import {
    createRecipe,
    deleteRecipe,
    updateRecipe,
    getRecipe,
    getRecipes,
    getUserRecipes,
} from "../controllers/recipe";
const recipeRoutes = new Hono();

recipeRoutes.post("/", verify, createRecipe);
recipeRoutes.get("/", verify, getRecipes);
recipeRoutes.get("/:id", verify, getRecipe);
recipeRoutes.delete("/:id", verify, deleteRecipe);
recipeRoutes.put("/:id", verify, updateRecipe);
recipeRoutes.get("/user/:id", verify, getUserRecipes);

export default recipeRoutes;
