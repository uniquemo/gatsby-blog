import React from 'react'
import { graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'

import Seo from 'components/SEO'
import Layout from 'components/Layout'
import Utterances from 'components/Utterances'

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.mdx
    const { title } = post.frontmatter

    const siteTitle = this.props.data.site.siteMetadata.title

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <Seo
          title={title}
          description={post.frontmatter.description || post.excerpt}
        />
        <div className='box'>
          <MDXRenderer>{post.body}</MDXRenderer>
          <Utterances title={`My Blog's About Page`} />
        </div>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query AboutPageBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      body
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "YYYY-MM-DD")
        description
        tags
        layout
      }
    }
  }
`
