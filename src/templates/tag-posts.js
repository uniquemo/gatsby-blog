import React from 'react'
import { graphql } from 'gatsby'
import styled from 'styled-components'

import Layout from 'components/Layout'
import Article from 'components/Article'

const PostWrap = styled.div`
  margin: 0 0 40px;
`

const TagPostsTemplate = props => {
  const siteTitle = props.data.site.siteMetadata.title
  const { posts } = props.pageContext

  return (
    <Layout location={props.location} title={siteTitle}>
      <PostWrap>
        {posts.map(({ node: post }, index) => <Article post={post} key={index} showTags />)}
      </PostWrap>
    </Layout>
  )
}

export default TagPostsTemplate

export const pageQuery = graphql`
  query TagPostsBySlug($slug: String!) {
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
      tableOfContents
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "YYYY-MM-DD")
        description
        layout
      }
    }
  }
`
