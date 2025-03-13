import { IRecipeSchema, Recipe } from "../models/Recipe";
import { verify as JwtVerify } from "hono/jwt";
import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { encodeBase64 } from "hono/utils/encode";
import { v2 as cloudinary } from "cloudinary";
import { isValidObjectId } from "mongoose";
import { IUserSchema, User } from "../models/User";

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

export const deleteRecipe = async (c: Context) => {
    try {
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

        const recipe: IRecipeSchema | null = await Recipe.findById(
            recipeId
        ).select("-__v -createdAt -updatedAt");

        if (recipe === null || undefined || 0) {
            return c.json(
                {
                    status: false,
                    message: `Recipe did not found with ${recipeId} id.`,
                },
                404
            );
        }

        const user: IUserSchema = c.get("user");

        if (
            user._id.toString() === recipe.user.toString() ||
            user.role === "admin"
        ) {
            const deletedRecipe: IRecipeSchema | null =
                await Recipe.findByIdAndDelete(recipeId).select(
                    "-__v -createdAt -updatedAt"
                );

            console.log("Deleted Recipe --> ", deletedRecipe);

            const deleteImageFromCloudinary = await cloudinary.uploader.destroy(
                recipe.recipeImage.publicId
            );
            console.log(deleteImageFromCloudinary);

            return c.json(
                {
                    status: true,
                    data: deletedRecipe,
                    message: "Recipe has been deleted successfully.",
                },
                200
            );
        }

        return c.json({
            status: false,
            message: "You can only delete your own recipe.",
        });
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
};

export const updateRecipe = async (c: Context) => {
    try {
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

        const recipe: IRecipeSchema | null = await Recipe.findById(
            recipeId
        ).select("-__v -createdAt -updatedAt");

        if (recipe === null || undefined || 0) {
            return c.json(
                {
                    status: false,
                    message: `Recipe did not found with ${recipeId} id.`,
                },
                404
            );
        }

        const user: IUserSchema = c.get("user");

        if (
            user._id.toString() === recipe.user.toString() ||
            user.role === "admin"
        ) {
            const body = await c.req.parseBody();
            const image = body["image"] as File;

            if (image) {
                const byteArrayBuffer = await image.arrayBuffer();
                const base64 = encodeBase64(byteArrayBuffer);
                const recipeImage = await cloudinary.uploader.upload(
                    `data:image/png;base64,${base64}`,
                    { resource_type: "auto", folder: "hono_uploads" }
                );

                console.log("file is uploaded on cloudinary ", recipeImage.url);

                console.log(recipe.recipeImage);

                const deleteImageFromCloudinary =
                    await cloudinary.uploader.destroy(
                        recipe.recipeImage.publicId
                    );
                console.log(deleteImageFromCloudinary);

                // Update recipeImage only if new image is provided
                recipe.recipeImage = {
                    publicId:
                        recipeImage.public_id || recipe.recipeImage.publicId,
                    imageUrl: recipeImage.url || recipe.recipeImage.imageUrl,
                };
            }

            const updatedRecipe: IRecipeSchema | null =
                await Recipe.findByIdAndUpdate(
                    recipeId,
                    {
                        $set: {
                            recipeImage: recipe.recipeImage,
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
                        },
                    },
                    { new: true }
                ).select("-__V");

            console.log("Updated Recipe --> ", updatedRecipe);

            return c.json(
                {
                    status: true,
                    data: updatedRecipe,
                    message: "Recipe has been updated successfully.",
                },
                200
            );
        }

        return c.json({
            status: false,
            message: "You can only update your own recipe.",
        });
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
};

export const getUserRecipes = async (c: Context) => {
    const userId = c.req.param("id");

    if (!isValidObjectId(userId) || !userId) {
        return c.json(
            {
                status: false,
                message: "Please search user with valid user id.",
            },
            404
        );
    }

    const user: IUserSchema | null = await User.findById(userId);

    if (!user)
        return c.json(
            {
                status: false,
                message: "User did not found! Or it does not exist!",
                data: [],
            },
            404
        );

    const recipes: IRecipeSchema[] = await Recipe.find({ user: userId }).sort({
        createdAt: -1,
    });

    if (recipes.length === 0) {
        return c.json({
            status: false,
            message: "No recipes found for given user!",
            data: [],
        });
    }

    return c.json({
        status: true,
        data: { numberOfRecipes: recipes.length, recipes, user },
    });
};
