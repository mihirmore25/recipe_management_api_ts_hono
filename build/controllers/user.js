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
exports.createUser = void 0;
const User_1 = require("../models/User");
const createUser = (c) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, role } = yield c.req.json();
    if (!username || !email || !password) {
        return c.json({
            status: false,
            data: [],
            message: "Username, Email & Password, Role are required.",
        }, 400);
    }
    const newUser = new User_1.User({
        username,
        email,
        password,
        role,
    });
    const isUserExist = yield User_1.User.findOne({ email });
    if (isUserExist)
        return c.json({
            status: false,
            data: [],
            message: "It seems you already have an user, please try creating user with different email.",
        }, 400);
    const savedUser = yield newUser.save();
    return c.json({
        status: true,
        message: "Your user account has been created successfully.",
        data: savedUser.toObject(),
    }, 201);
});
exports.createUser = createUser;
