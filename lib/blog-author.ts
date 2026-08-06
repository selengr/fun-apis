/** Shared author assets for blog UI */
export const BLOG_AUTHOR_NAME = 'Reza Karbakhsh'
export const BLOG_AUTHOR_IMAGE = '/images/authors/reza.jpg'
export const BLOG_AUTHOR_IMAGE_PNG = '/images/authors/reza-edited.png'
export const BLOG_AUTHOR_IMAGE_ORIGINAL = '/images/authors/reza-original.jpg'

/** Always serve author photo from this site (Notion URL fields may point at stale prod URLs). */
export function resolveAuthorImage(_fromNotion?: string | null) {
  return BLOG_AUTHOR_IMAGE
}
