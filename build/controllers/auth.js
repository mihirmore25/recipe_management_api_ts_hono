"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("hono/jwt");
const cookie_1 = require("hono/cookie");
const register = (c) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = yield c.req.json();
    if (!username || !email || !password) {
        return c.json({
            status: false,
            error: c.res.status,
            data: [],
            message: "Username, Email, Password are required",
        }, 400);
    }
    const newUser = new User_1.User({
        username,
        email,
        password,
    });
    const isUserExist = yield User_1.User.findOne({ email });
    if (isUserExist)
        return c.json({
            status: false,
            error: c.res.status,
            data: [],
            message: "It seems you already have an user, please try creating user with different email.",
        }, 400);
    const savedUser = yield newUser.save();
    return c.json({
        status: true,
        message: "Thank you for registering with us. Your account has been created successfully.",
        data: savedUser.toObject(),
    }, 201);
});
exports.register = register;
const login = (c) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = yield c.req.json();
    if (!email || !password) {
        return c.json({
            status: false,
            error: c.res.status,
            data: [],
            message: "Email, Password are required",
        }, 400);
    }
    const user = yield User_1.User.findOne({ email }).select("+password");
    if (!user) {
        return c.json({
            status: false,
            error: c.res.status,
            data: [],
            message: "Invalid email or password. Please try again with the correct credentials.",
        }, 401);
    }
    const isPasswordValid = yield user.isPasswordValid(password);
    if (!isPasswordValid) {
        return c.json({
            status: false,
            error: c.res.status,
            data: [],
            message: "Invalid email or password. Please try again with the correct credentials.",
        }, 401);
    }
    // const { password, ...user_data } = user;
    // let options = {
    //     expiresIn: 24 * 60 * 60 * 1000, // would expire in 1 day
    //     httpOnly: true, // The cookie is only accessible by the web server
    // };
    const token = yield user.generateJWT();
    (0, cookie_1.setCookie)(c, "access_token", token, {
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
});
exports.login = login;
const logout = (c) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, cookie_1.getCookie)(c, "access_token");
    const user_data = yield (0, jwt_1.verify)(token, "secret_mihir_jwt");
    const user = yield User_1.User.findById(user_data.id);
    console.log("Logout User --> ", user);
    const deletedCookie = (0, cookie_1.deleteCookie)(c, "access_token", {
        sameSite: "none",
        secure: true,
    });
    return c.json({
        status: false,
        data: [deletedCookie],
        message: "You have been logged out successfully...",
    });
});
exports.logout = logout;
