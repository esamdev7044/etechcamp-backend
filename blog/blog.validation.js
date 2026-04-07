const { z } = require("zod");

exports.createBlogSchema = z.object({
  title: z.string().min(5).max(150),
  slug: z.string().min(5).max(150).optional(),
  subtitle: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  content: z.string().min(20),
  category_id: z.number().int().positive(),
  language_code: z.string().min(2).max(10),
  is_featured: z.boolean().optional(),
});

exports.updateBlogSchema = z.object({
  title: z.string().min(5).max(150).optional(),
  slug: z.string().min(5).max(150).optional(),
  subtitle: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  content: z.string().min(20).optional(),
  category_id: z.number().int().positive().optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

exports.slugParamSchema = z.object({
  slug: z.string().min(3).max(150),
});

exports.idParamSchema = z.object({
  id: z.string().uuid(),
});
