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
  params: z.object({
    id: z.string().uuid("Invalid module ID"),
  }),
  body: z.object({
    lang_code: z.string().min(2, "Language code is required"),
    title: z.string().min(2, "Title is required"),
  }),
});

exports.getModulesSchema = z.object({
  params: z.object({
    tutorialId: z.string().uuid("Invalid tutorial ID"),
  }),
});

exports.getModulesByTutorialSchema = z.object({
  params: z.object({
    tutorialId: z.string().uuid("Invalid tutorial ID"),
    lang: z.string().min(2, "Language is required"),
  }),
});

exports.updateModuleSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid module ID"),
  }),
  body: z.object({
    slug: z.string().min(2).optional(),
    order_index: z.number().int().min(0).optional(),
  }),
});

exports.updateModuleTranslationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid module ID"),
    lang: z.string().min(2, "Language is required"),
  }),
  body: z.object({
    title: z.string().min(2, "Title is required"),
  }),
});

exports.deleteModuleSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid module ID"),
  }),
});