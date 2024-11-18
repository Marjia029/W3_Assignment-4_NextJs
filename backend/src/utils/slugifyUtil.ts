import slugify from 'slugify';

export const createSlug = (title: string): string => {
  return slugify(title, { lower: true, strict: true });
};
