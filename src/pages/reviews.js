import React from 'react'
import { graphql } from 'gatsby'
import styled from 'styled-components'

import Link from 'common-styles/Link'
import Layout from 'components/Layout'
import SEO from 'components/SEO'

import COLORS from 'constants/colors'
import ROUTES from 'constants/routes'

const Title = styled.div`
  padding: 5px 0;
  color: ${COLORS.FONT_BLACK};

  & a:hover {
    color: ${COLORS.FONT_PRIMARY};
  }
`

const Item = ({ post }) => {
  const title = post.frontmatter.title || post.fields.slug
  const description = post.frontmatter.description
  const postLink = `${ROUTES.REVIEWS}${post.fields.slug}`

  return (
    <Title>
      <Link to={postLink}>
        <strong>{title}</strong>
      </Link>
      {description && <span>{`  ${description}`}</span>}
    </Title>
  )
}

const Reviews = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMdx.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title='All reviews' />
      <div className='box'>
        {posts.map(({ node: post }, index) => <Item post={post} key={index} />)}
      </div>
    </Layout>
  )
}

export default Reviews

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { layout: { eq: "review-post" } } }
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
          }
        }
      }
    }
  }
`
