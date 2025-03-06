import { User, type IUserSchema } from "../models/User";
import { verify } from "hono/jwt";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";

export const register = async (c: Context) => {
    const { username, email, password }: IUserSchema = await c.req.json();

    if (!username || !email || !password) {
        return c.json(
            {
                status: false,
                error: c.res.status,
                data: [],
                message: "Username, Email, Password are required",
            },
            400
        );
    }

    const newUser: IUserSchema = new User({
        username,
        email,
        password,
    });

    const isUserExist: IUserSchema | null = await User.findOne({ email });
    if (isUserExist)
        return c.json(
            {
                status: false,
                error: c.res.status,
                data: [],
                message:
                    "It seems you already have an user, please try creating user with different email.",
            },
            400
        );

    const savedUser = await newUser.save();
    return c.json(
        {
            status: true,
            message:
                "Thank you for registering with us. Your account has been created successfully.",
            data: savedUser.toObject(),
        },
        201
    );
};

export const login = async (c: Context) => {
    const { email, password }: IUserSchema = await c.req.json();

    if (!email || !password) {
        return c.json(
            {
                status: false,
                error: c.res.status,
                data: [],
                message: "Email, Password are required",
            },
            400
        );
    }

    const user: IUserSchema | null = await User.findOne({ email }).select(
        "+password"
    );

    if (!user) {
        return c.json(
            {
                status: false,
                error: c.res.status,
                data: [],
                message:
                    "Invalid email or password. Please try again with the correct credentials.",
            },
            401
        );
    }

    const isPasswordValid = await user.isPasswordValid(password);

    if (!isPasswordValid) {
        return c.json(
            {
                status: false,
                error: c.res.status,
                data: [],
                message:
                    "Invalid email or password. Please try again with the correct credentials.",
            },
            401
        );
    }

    // const { password, ...user_data } = user;

    // let options = {
    //     expiresIn: 24 * 60 * 60 * 1000, // would expire in 1 day
    //     httpOnly: true, // The cookie is only accessible by the web server
    // };

    const token = await user.generateJWT();

    setCookie(c, "access_token", token, {
        maxAge: 30 * 60 * 1000, // would expire in 30 minutes
        httpOnly: true,
        sameSite: "Strict",
    });

    return c.json({
        status: true,
        data: [user],
        token,
        message: "You have successfully logged in.",
    });
};

export const logout = async (c: Context) => {
    const token: string = getCookie(c, "access_token")!;

    const user_data = await verify(token, process.env.JWT_SECRET!);

    const user: IUserSchema | null = await User.findById(user_data.id);
    console.log("Logout User --> ", user);

    const deletedCookie = deleteCookie(c, "access_token", {
        sameSite: "none",
        secure: true,
    });

    return c.json({
        status: false,
        data: [deletedCookie],
        message: "You have been logged out successfully...",
    });
};
