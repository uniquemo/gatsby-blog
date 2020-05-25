export const PATHS = {
  ARTICLES: 'articles',
  ARCHIVES: 'archives',
  TAGS: 'tags',
  REVIEWS: 'reviews',
  ABOUT: 'about'
}

const HOME = `${__PATH_PREFIX__}/`
const ARTICLES = `${HOME}${PATHS.ARTICLES}`
const ARCHIVES = `${HOME}${PATHS.ARCHIVES}`
const TAGS = `${HOME}${PATHS.TAGS}`
const REVIEWS = `${HOME}${PATHS.REVIEWS}`
const ABOUT = `${HOME}${PATHS.ABOUT}`

const ROUTES = {
  HOME,
  ARTICLES,
  ARCHIVES,
  TAGS,
  REVIEWS,
  ABOUT
}

export default ROUTES
