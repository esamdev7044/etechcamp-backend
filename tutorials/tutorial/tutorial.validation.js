const { query } = require("express-validator");
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
});

exports.updateTutorialSchema = z.object({
  body: z.object({
    slug: z.string().max(50).optional(),
  }),
});

exports.updateTranslationSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  }),
});

exports.idParamSchema = z.object({
  id: z.string().uuid(),
});

exports.langQuerySchema = z.object({
  lang: z.string().min(2).max(5),
});
