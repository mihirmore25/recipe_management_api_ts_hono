import { Context } from "hono";
import { User, type IUserSchema } from "../models/User";

export const createUser = async (c: Context) => {
    const { username, email, password, role }: IUserSchema = await c.req.json();

    if (!username || !email || !password) {
        return c.json(
            {
                status: false,
                data: [],
                message: "Username, Email & Password, Role are required.",
            },
            400
        );
    }

    const newUser: IUserSchema = new User({
        username,
        email,
        password,
        role,
    });

    const isUserExist: IUserSchema | null = await User.findOne({ email });
    if (isUserExist)
        return c.json(
            {
                status: false,
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
            message: "Your user account has been created successfully.",
            data: savedUser.toObject(),
        },
        201
    );
};
