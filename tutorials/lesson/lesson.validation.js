const { z } = require("zod");

const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1),
      options: z.array(z.string().min(1)).min(2),
      answer: z.string().min(1),
    })
  ).min(1),
});

exports.idParamSchema = z.object({
  id: z.string().uuid("Invalid lesson ID"),
});

exports.moduleParamSchema = z.object({
  moduleId: z.string().uuid("Invalid module ID"),
});

exports.langQuerySchema = z.object({
  lang: z.string().min(2).max(5),
});

exports.createLessonSchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(3, "Slug must be at least 3 chars")
      .max(100)
      .trim(),

    videoUrl: z
      .string()
      .url("Invalid video URL")
      .optional()
      .nullable(),

    order_index: z
      .number()
      .int()
      .min(0)
      .optional(),
  }),
});

exports.updateLessonSchema = z.object({
  body: z
    .object({
      slug: z.string().min(3).max(100).trim().optional(),

      videoUrl: z
        .string()
        .url("Invalid video URL")
        .optional()
        .nullable(),

      order_index: z
        .number()
        .int()
        .min(0)
        .optional(),
    })
    .refine(
      (data) =>
        data.slug !== undefined ||
        data.videoUrl !== undefined ||
        data.order_index !== undefined,
      {
        message: "At least one field must be provided",
      }
    ),
});

exports.lessonTranslationSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(2, "Title is required")
      .max(255),

    content: z.string().min(10),
    practice: z.string().optional().nullable(),
    quiz: quizSchema,
  }),
});
