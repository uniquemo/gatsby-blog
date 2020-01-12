import React from 'react'
import { graphql } from 'gatsby'
import styled from 'styled-components'

import Layout from 'components/Layout'
import SEO from 'components/SEO'
import Article from 'components/Article'

const PostWrap = styled.div`
  margin: 0 0 40px;
`

const Articles = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMdx.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title='All posts' />
      <PostWrap>
        {posts.map(({ node: post }, index) => <Article post={post} key={index} showTags />)}
      </PostWrap>
    </Layout>
  )
}

export default Articles

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "YYYY-MM-DD")
            title
            description
            tags
          }
        }
      }
    }
  }
`
