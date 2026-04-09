const { z } = require("zod");

exports.createTutorialSchema = z.object({
  body: z.object({
    slug: z.string().min(2).max(100),
  }),
});

exports.createTranslationSchema = z.object({
  body: z.object({
    lang_code: z.string().min(2).max(5),
    title: z.string().min(1),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

exports.getTutorialsByLangSchema = z.object({
  params: z.object({
    lang: z.string().min(2).max(5),
  }),
});

exports.getTutorialByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    lang: z.string().min(2).max(5),
  }),
});

exports.updateTutorialSchema = z.object({
  params: z.object({
    id: z.string().uuid(), 
  }),
  body: z.object({
    slug: z.string().max(50).optional(),
  }),
});

exports.updateTranslationSchema = z.object({
  params: z.object({
    id: z.string().uuid(), 
    lang: z.string().min(2).max(10),
  }),
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  }),
});

exports.removeTutorialSchema = z.object({
  params: z.object({
    id: z.string().uuid(), 
  }),
});