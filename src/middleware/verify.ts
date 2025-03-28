import { IUserSchema, User } from "../models/User";
import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verify as JwtVerify } from "hono/jwt";

export const verify = async (c: Context, next: Next) => {
    try {
        const token: string = getCookie(c, "access_token")!;

        if (!token) {
            return c.json(
                {
                    status: false,
                    message:
                        "Not authorize to access this route, Please try logging in first.",
                },
                401
            );
        }

        const user_data = await JwtVerify(token, process.env.JWT_SECRET!);

        if (!user_data)
            return c.json(
                {
                    status: false,
                    message: "This session has expired. Please login",
                },
                401
            );

        const user: IUserSchema | null = await User.findById(user_data.id);
        const { password, ...data }: IUserSchema = user?.toObject();

        c.set("user", data);
        await next();
    } catch (error) {
        const err = error as Error;
        if (err.name === "JwtTokenExpired") {
            return c.json(
                {
                    error: "Token expired, please login again!",
                },
                401
            );
        }

        return c.json({ error: "Invalid token" }, 401);
    }
};
