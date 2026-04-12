const { z } = require("zod");

exports.createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(150),
    slug: z.string().min(5).max(150).optional(),
    subtitle: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    content: z.string().min(20),
    category_slug: z.string().min(3).max(150),
    language_code: z.string().min(2).max(10),
    is_featured: z.coerce.boolean().optional(),
    is_published: z.coerce.boolean().optional(),
  }),

  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

exports.updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(150).optional(),
    slug: z.string().min(5).max(150).optional(),
    subtitle: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    content: z.string().min(20).optional(),
    category_id: z.coerce.number().int().positive().optional(),
    is_featured: z.coerce.boolean().optional(),
    is_published: z.coerce.boolean().optional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),

  query: z.object({}).optional(),
});

exports.slugParamSchema = z.object({
  slug: z.string().min(3).max(150),
});

exports.idParamSchema = z.object({
  id: z.string().uuid(),
});

exports.blogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});
