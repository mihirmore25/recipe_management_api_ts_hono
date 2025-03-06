"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = require("./db/db");
const powered_by_1 = require("hono/powered-by");
const logger_1 = require("hono/logger");
const app = new hono_1.Hono();
app.use((0, logger_1.logger)());
app.use((0, powered_by_1.poweredBy)({ serverName: "Recipe Management REST API with Hono" }));
(0, db_1.dbClient)()
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
exports.default = app;
