"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const app = new hono_1.Hono();
app.get("/", (c) => c.text("Hello, Hono with typescript!"));
exports.default = app;
