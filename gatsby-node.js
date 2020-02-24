const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const LAYOUT_TYPES = {
  BLOG_POST: 'blog-post',
  REVIEW_POST: 'review-post',
  ABOUT_PAGE: 'about-page'
}

const createMdPage = (allPosts, layoutType, pathPrefix, component, action) => {
  const posts = allPosts.filter(post => post.node.frontmatter.layout === layoutType)
  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    action({
      path: `${pathPrefix}${post.node.fields.slug}`,
      component,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const reviewPost = path.resolve(`./src/templates/review-post.js`)
  const aboutPage = path.resolve(`./src/templates/about-page.js`)

  return graphql(
    `
      {
        allMdx(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 10000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                layout
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    const posts = result.data.allMdx.edges

    createMdPage(posts, LAYOUT_TYPES.BLOG_POST, 'articles', blogPost, createPage)
    createMdPage(posts, LAYOUT_TYPES.REVIEW_POST, 'reviews', reviewPost, createPage)

    posts
      .filter(post => post.node.frontmatter.layout === LAYOUT_TYPES.ABOUT_PAGE)
      .forEach(post => (
        createPage({
          path: 'about',
          component: aboutPage,
          context: {
            slug: post.node.fields.slug
          }
        })
      ))

    return null
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `Mdx`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules']
    }
  })
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type Mdx implements Node {
      frontmatter: Frontmatter
    }
    type Frontmatter {
      tags: [String]
      layout: String
    }
  `
  createTypes(typeDefs)
}
