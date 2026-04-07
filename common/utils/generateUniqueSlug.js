const slugify = require("slugify");
const { AppError } = require("../middlewares/errorHandler");

const generateUniqueSlug = async ({ base, checkExists, maxRetries = 10 }) => {
  const baseSlug = slugify(base, { lower: true, strict: true }).slice(0, 50);

  let slug = baseSlug;

  for (let i = 0; i < maxRetries; i++) {
    const exists = await checkExists(slug);
    if (!exists) return slug;

    slug = `${baseSlug}-${i + 1}`;
  }

  throw new AppError("Failed to generate unique slug", 500);
};

module.exports = { generateUniqueSlug };
