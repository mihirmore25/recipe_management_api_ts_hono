import { Hono } from "hono";
import { login, logout, register } from "../controllers/auth";
import { verify } from "../middleware/verify";
const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", verify, logout);

export default authRoutes;
