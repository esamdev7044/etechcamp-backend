const { z } = require("zod");

const { z } = require("zod");

exports.registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .max(255, "Email too long")
      .transform((val) => val.toLowerCase().trim()),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/[0-9]/, "Must include at least one number")
      .regex(/[@$!%*?&]/, "Must include at least one special character"),
  }),
});

exports.loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  }),
});

exports.profileSchema = z.object({
  body: z
    .object({
      userId: z
        .number({ invalid_type_error: "User ID must be a number" })
        .int()
        .positive(),

      full_name: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(100)
        .trim()
        .optional(),

      age: z.number().int().min(13, "Minimum age is 13").max(120).optional(),

      region: z.string().min(2).max(100).trim().optional(),

      city: z.string().min(2).max(100).trim().optional(),

      gender: z.enum(["male", "female", "other"]).optional(),

      profile_picture: z.string().url("Invalid image URL").optional(),

      profilePublicId: z.string().max(255).optional(),

      bio: z.string().max(500).trim().optional(),
    })
    .strict(),
});
