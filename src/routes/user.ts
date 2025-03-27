import { Hono } from "hono";
import { isAdmin } from "../middleware/isAdmin";
import { verify } from "../middleware/verify";
import { createUser } from "../controllers/user";

const userRoutes = new Hono();

userRoutes.post("/createUser", verify, isAdmin, createUser);

export default userRoutes;
