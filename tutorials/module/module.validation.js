const { z } = require("zod");

exports.createModuleSchema = z.object({
  body: z.object({
    slug: z.string().min(2, "Slug is required"),
  }),
  params: z.object({
    tutorialId: z.string().uuid("Invalid tutorial ID"),
  }),
});

exports.moduleTranslationSchema = z.object({
  body: z.object({
    lang_code: z.string().min(2, "Language code is required"),
    title: z.string().min(2, "Title is required"),
  }),
});

exports.updateModuleSchema = z.object({
  body: z.object({
    slug: z.string().min(2).optional(),
    order_index: z.number().int().min(0).optional(),
  }),
});

exports.updateModuleTranslationSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title is required"),
  }),
});

exports.tutorialIdSchema = z.object({
  tutorialId: z.string().uuid(),
});

exports.idParamSchema = z.object({
  id: z.string().uuid(),
});

exports.langQuerySchema = z.object({
  lang: z.string().uuid().min(2).max(5),
});
