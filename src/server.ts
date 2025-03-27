import { Context, Hono, Next } from "hono";
import { dbClient } from "./db/db";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import recipeRoutes from "./routes/recipe";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryMiddleware } from "./middleware/cloudinary";
import userRoutes from "./routes/user";

const app = new Hono();

app.use(logger());
app.use(poweredBy({ serverName: "Recipe Management REST API with Hono" }));
app.use(cloudinaryMiddleware);

// Routes
app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/recipes", recipeRoutes);
app.route("/api/v1/admin/users", userRoutes);

dbClient()
    .then()
    .catch((err) => {
        app.get("/*", (c) => {
            return c.json(`Failed to connect mongodb: ${err.message}`);
        });
    });

app.onError((err, c) => {
    return c.text(`App Error: ${err.message}`);
});

app.get("/", (c) => c.text("Hello, Hono with typescript!"));

export default app;
