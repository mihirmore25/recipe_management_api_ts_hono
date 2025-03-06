import { Hono } from "hono";
import { dbClient } from "./db/db";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";

const app = new Hono();

app.use(logger());
app.use(poweredBy({ serverName: "Recipe Management REST API with Hono" }));

// Routes
app.route("/api/v1/auth", authRoutes);

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
