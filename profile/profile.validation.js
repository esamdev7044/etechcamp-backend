const { z } = require("zod");
exports.profileSchema = z.object({
  body: z
    .object({
      fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must be at most 100 characters")
        .trim(),

      age: z
        .number()
        .int("Age must be an integer")
        .min(13, "Minimum age is 13")
        .max(120, "Maximum age is 120"),

      region: z
        .string()
        .min(2, "Region must be at least 2 characters")
        .max(100, "Region must be at most 100 characters")
        .trim(),

      city: z
        .string()
        .min(2, "City must be at least 2 characters")
        .max(100, "City must be at most 100 characters")
        .trim(),

      gender: z.enum(
        ["male", "female", "other"],
        "Gender must be 'male', 'female', or 'other'",
      ),

      imageUrl: z.string().url("Invalid image URL").optional(),
    })
    .strict(),
});


exports.validateUserId = z.object({
  userId: z.string().uuid("Invalid user ID"),
});
