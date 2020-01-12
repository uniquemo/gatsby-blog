export const PATHS = {
  ARTICLES: 'articles',
  ARCHIVES: 'archives',
  TAGS: 'tags',
  ABOUT: 'about'
}

const HOME = `${__PATH_PREFIX__}/`
const ARTICLES = `${HOME}${PATHS.ARTICLES}`
const ARCHIVES = `${HOME}${PATHS.ARCHIVES}`
const TAGS = `${HOME}${PATHS.TAGS}`
const ABOUT = `${HOME}${PATHS.ABOUT}`

const ROUTES = {
  HOME,
  ARTICLES,
  ARCHIVES,
  TAGS,
  ABOUT
}

export default ROUTES
