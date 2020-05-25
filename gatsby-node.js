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

// 根据tag来生成不同tag下的文章列表
const createTagPage = (allPosts, component, action) => {
  const posts = allPosts.filter(post => post.node.frontmatter.layout === LAYOUT_TYPES.BLOG_POST)

  const tagsMap = new Map()
  for (const post of posts) {
    const tags = post.node.frontmatter.tags || []

    if (!tags.length) {
      continue
    }

    for (const tag of tags) {
      const originData = tagsMap.get(tag) || { count: 0, posts: [] }
      tagsMap.set(tag, {
        count: originData.count + 1,
        posts: [...originData.posts, post]
      })
    }
  }

  for (const [tag, data] of Array.from(tagsMap)) {
    const { count, posts } = data
    action({
      path: `tags/${tag}`,
      component,
      context: {
        slug: tag,
        posts
      }
    })
  }
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const reviewPost = path.resolve(`./src/templates/review-post.js`)
  const aboutPage = path.resolve(`./src/templates/about-page.js`)
  const tagPosts = path.resolve(`./src/templates/tag-posts.js`)

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
                tags
                date(formatString: "YYYY-MM-DD")
                description
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
    createTagPage(posts, tagPosts, createPage)

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
