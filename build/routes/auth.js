"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const auth_1 = require("../controllers/auth");
const authRoutes = new hono_1.Hono();
authRoutes.post("/register", auth_1.register);
authRoutes.post("/login", auth_1.login);
authRoutes.post("/logout", auth_1.logout);
exports.default = authRoutes;
