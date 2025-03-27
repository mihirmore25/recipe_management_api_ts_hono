"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const isAdmin_1 = require("../middleware/isAdmin");
const verify_1 = require("../middleware/verify");
const user_1 = require("../controllers/user");
const userRoutes = new hono_1.Hono();
userRoutes.post("/createUser", verify_1.verify, isAdmin_1.isAdmin, user_1.createUser);
exports.default = userRoutes;
