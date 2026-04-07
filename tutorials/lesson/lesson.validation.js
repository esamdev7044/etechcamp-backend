const { z } = require("zod");

const idParam = z.object({
  id: z.string().uuid("Invalid lesson ID"),
});

const moduleParam = z.object({
  moduleId: z.string().uuid("Invalid module ID"),
});

const langParam = z.object({
  lang: z.string().min(2).max(5),
});

exports.createLessonSchema = z.object({
  params: moduleParam,
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
  params: idParam,
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
  params: idParam.merge(langParam),
  body: z.object({
    title: z
      .string()
      .min(2, "Title is required")
      .max(255),

    content: z.string().optional().nullable(),
    practice: z.string().optional().nullable(),
    quiz: z.string().optional().nullable(),
  }),
});

exports.getLessonsSchema = z.object({
  params: moduleParam,
  query: z.object({
    lang: z.string().min(2).max(5).optional(),
  }),
});

exports.deleteLessonSchema = z.object({
  params: idParam,
});