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
