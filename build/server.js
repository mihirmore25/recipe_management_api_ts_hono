"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = require("./db/db");
const powered_by_1 = require("hono/powered-by");
const logger_1 = require("hono/logger");
const auth_1 = __importDefault(require("./routes/auth"));
const app = new hono_1.Hono();
app.use((0, logger_1.logger)());
app.use((0, powered_by_1.poweredBy)({ serverName: "Recipe Management REST API with Hono" }));
// Routes
app.route("/api/v1/auth", auth_1.default);
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
