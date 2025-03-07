import { IRecipeSchema, Recipe } from "../models/Recipe";
import { verify as JwtVerify } from "hono/jwt";
import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { encodeBase64 } from "hono/utils/encode";
import { v2 as cloudinary } from "cloudinary";
import { isValidObjectId } from "mongoose";

export const createRecipe = async (c: Context) => {
    try {
        const token: string = getCookie(c, "access_token")!;

        if (!token) {
            return c.json({
                status: false,
                error: c.res.status,
                message:
                    "Not authorize to access this route, Please try logging in first.",
            });
        }

        const formBody = await c.req.formData();

        // create object literal for storing req body of multipart-data
        const reqBody: Record<string, string | File> = {};

        for (const [key, value] of formBody.entries()) {
            reqBody[key] = value;
        }

        // console.log(reqBody);
        const {
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
        } = reqBody;

        if (
            !title ||
            !description ||
            !totalTime ||
            !prepTime ||
            !cookingTime ||
            !ingredients ||
            !instructions ||
            !calories ||
            !carbs ||
            !protein ||
            !fat
        ) {
            return c.json(
                {
                    status: false,
                    error: c.res.status,
                    message: "All the given fields are required.",
                },
                400
            );
        }

        const user_data = await JwtVerify(token, process.env.JWT_SECRET!);

        if (!user_data)
            return c.json({
                status: false,
                message: "This session has expired. Please login",
            });

        const body = await c.req.parseBody();
        const image = body["image"] as File;
        const byteArrayBuffer = await image.arrayBuffer();
        const base64 = encodeBase64(byteArrayBuffer);
        const recipeImage = await cloudinary.uploader.upload(
            `data:image/png;base64,${base64}`,
            { resource_type: "auto", folder: "hono_uploads" }
        );

        console.log("file is uploaded on cloudinary ", recipeImage.url);
        // return c.json(recipeImage);

        const newRecipe: IRecipeSchema = await Recipe.create({
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

        const newCreatedRecipe = await newRecipe.save();

        console.log(newCreatedRecipe.toObject());

        return c.json({
            status: true,
            data: [newCreatedRecipe.toObject()],
            message: "New Recipe created successfully.",
        });
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
};

export const getRecipes = async (c: Context) => {
    const recipes: IRecipeSchema[] = await Recipe.find()
        .limit(8)
        .sort({ createdAt: -1 })
        .select("-__v");

    if (recipes.length === 0 || recipes === null || 0) {
        return c.json(
            {
                status: false,
                message: "Recipes not found! Try creating new recipe",
            },
            404
        );
    }

    return c.json({ status: true, data: recipes });
};

export const getRecipe = async (c: Context) => {
    const recipeId = c.req.param("id");

    if (!isValidObjectId(recipeId) || !recipeId) {
        return c.json(
            {
                status: false,
                message: "Please search recipe with valid recipe id.",
            },
            404
        );
    }

    const recipe: IRecipeSchema | null = await Recipe.findById(recipeId).select(
        "-__v -createdAt -updatedAt"
    );

    if (recipe === null || undefined || 0) {
        return c.json(
            {
                status: false,
                message: `Recipe did not found with ${recipeId} id.`,
            },
            404
        );
    }

    return c.json(
        {
            status: true,
            data: recipe,
        },
        200
    );
};
