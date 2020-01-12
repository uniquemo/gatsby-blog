const TAGS = ['is-primary', 'is-warning', 'is-link', 'is-info', 'is-success', 'is-danger', 'is-light']

const genRandomTag = (index) => TAGS[index % 7]

const randomUtils = {
  genRandomTag
}

export default randomUtils
