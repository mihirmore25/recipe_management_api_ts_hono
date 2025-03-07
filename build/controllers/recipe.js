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
exports.deleteRecipe = exports.getRecipe = exports.getRecipes = exports.createRecipe = void 0;
const Recipe_1 = require("../models/Recipe");
const jwt_1 = require("hono/jwt");
const cookie_1 = require("hono/cookie");
const encode_1 = require("hono/utils/encode");
const cloudinary_1 = require("cloudinary");
const mongoose_1 = require("mongoose");
const createRecipe = (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = (0, cookie_1.getCookie)(c, "access_token");
        if (!token) {
            return c.json({
                status: false,
                error: c.res.status,
                message: "Not authorize to access this route, Please try logging in first.",
            });
        }
        const formBody = yield c.req.formData();
        // create object literal for storing req body of multipart-data
        const reqBody = {};
        for (const [key, value] of formBody.entries()) {
            reqBody[key] = value;
        }
        // console.log(reqBody);
        const { title, description, totalTime, prepTime, cookingTime, ingredients, instructions, calories, carbs, protein, fat, } = reqBody;
        if (!title ||
            !description ||
            !totalTime ||
            !prepTime ||
            !cookingTime ||
            !ingredients ||
            !instructions ||
            !calories ||
            !carbs ||
            !protein ||
            !fat) {
            return c.json({
                status: false,
                error: c.res.status,
                message: "All the given fields are required.",
            }, 400);
        }
        const user_data = yield (0, jwt_1.verify)(token, process.env.JWT_SECRET);
        if (!user_data)
            return c.json({
                status: false,
                message: "This session has expired. Please login",
            });
        const body = yield c.req.parseBody();
        const image = body["image"];
        const byteArrayBuffer = yield image.arrayBuffer();
        const base64 = (0, encode_1.encodeBase64)(byteArrayBuffer);
        const recipeImage = yield cloudinary_1.v2.uploader.upload(`data:image/png;base64,${base64}`, { resource_type: "auto", folder: "hono_uploads" });
        console.log("file is uploaded on cloudinary ", recipeImage.url);
        // return c.json(recipeImage);
        const newRecipe = yield Recipe_1.Recipe.create({
            recipeImage: {
                publicId: recipeImage.public_id,
                imageUrl: recipeImage.url || "",
            },
            title,
            description,
            totalTime,
            prepTime,
            cookingTime,
            ingredients,
            instructions,
            calories,
            carbs,
            protein,
            fat,
            user: user_data.id,
        });
        const newCreatedRecipe = yield newRecipe.save();
        console.log(newCreatedRecipe.toObject());
        return c.json({
            status: true,
            data: [newCreatedRecipe.toObject()],
            message: "New Recipe created successfully.",
        });
    }
    catch (error) {
        return c.json({ error: error.message }, 500);
    }
});
exports.createRecipe = createRecipe;
const getRecipes = (c) => __awaiter(void 0, void 0, void 0, function* () {
    const recipes = yield Recipe_1.Recipe.find()
        .limit(8)
        .sort({ createdAt: -1 })
        .select("-__v");
    if (recipes.length === 0 || recipes === null || 0) {
        return c.json({
            status: false,
            message: "Recipes not found! Try creating new recipe",
        }, 404);
    }
    return c.json({ status: true, data: recipes });
});
exports.getRecipes = getRecipes;
const getRecipe = (c) => __awaiter(void 0, void 0, void 0, function* () {
    const recipeId = c.req.param("id");
    if (!(0, mongoose_1.isValidObjectId)(recipeId) || !recipeId) {
        return c.json({
            status: false,
            message: "Please search recipe with valid recipe id.",
        }, 404);
    }
    const recipe = yield Recipe_1.Recipe.findById(recipeId).select("-__v -createdAt -updatedAt");
    if (recipe === null || undefined || 0) {
        return c.json({
            status: false,
            message: `Recipe did not found with ${recipeId} id.`,
        }, 404);
    }
    return c.json({
        status: true,
        data: recipe,
    }, 200);
});
exports.getRecipe = getRecipe;
const deleteRecipe = (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recipeId = c.req.param("id");
        if (!(0, mongoose_1.isValidObjectId)(recipeId) || !recipeId) {
            return c.json({
                status: false,
                message: "Please search recipe with valid recipe id.",
            }, 404);
        }
        const recipe = yield Recipe_1.Recipe.findById(recipeId).select("-__v -createdAt -updatedAt");
        if (recipe === null || undefined || 0) {
            return c.json({
                status: false,
                message: `Recipe did not found with ${recipeId} id.`,
            }, 404);
        }
        const user = c.get("user");
        if (user._id.toString() === recipe.user.toString() || user.role === "admin") {
            const deletedRecipe = yield Recipe_1.Recipe.findByIdAndDelete(recipeId).select("-__v -createdAt -updatedAt");
            console.log("Deleted Recipe --> ", deletedRecipe);
            const deleteImageFromCloudinary = yield cloudinary_1.v2.uploader.destroy(recipe.recipeImage.publicId);
            console.log(deleteImageFromCloudinary);
            return c.json({
                status: true,
                data: deletedRecipe,
                message: "Recipe has been deleted successfully.",
            }, 200);
        }
    }
    catch (error) {
        return c.json({ error: error.message }, 500);
    }
});
exports.deleteRecipe = deleteRecipe;
