"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const verify_1 = require("../middleware/verify");
const recipe_1 = require("../controllers/recipe");
const recipeRoutes = new hono_1.Hono();
recipeRoutes.post("/", verify_1.verify, recipe_1.createRecipe);
recipeRoutes.get("/", verify_1.verify, recipe_1.getRecipes);
exports.default = recipeRoutes;
