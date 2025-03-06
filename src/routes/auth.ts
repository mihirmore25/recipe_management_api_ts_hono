import { Hono } from "hono";
import { login, logout, register } from "../controllers/auth";
const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

export default authRoutes;
