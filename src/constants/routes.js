export const PATHS = {
  ARTICLES: 'articles',
  ARCHIVES: 'archives',
  ABOUT: 'about'
}

const HOME = `${__PATH_PREFIX__}`
const ARTICLES = `${HOME}/${PATHS.ARTICLES}`
const ARCHIVES = `${HOME}/${PATHS.ARCHIVES}`
const ABOUT = `${HOME}/${PATHS.ABOUT}`

const ROUTES = {
  HOME,
  ARTICLES,
  ARCHIVES,
  ABOUT
}

export default ROUTES
