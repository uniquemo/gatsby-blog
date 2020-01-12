import React from 'react'
import { graphql } from 'gatsby'
import styled from 'styled-components'

import Layout from '../components/Layout'
import SEO from '../components/SEO'
import Article from '../components/Article'
import Link from '../common-styles/Link'
import { BlockTitle } from '../common-styles/Title'
import ROUTES from '../constants/routes'

const LatestArticles = styled.div``
const LatestArticlesWrap = styled.div``

const IndexPage = ({ data, location }) => {
  const latestPosts = data.allMdx.edges

  return (
    <Layout location={location}>
      <SEO title='Home' keywords={[`blog`, `gatsby`, `javascript`, `react`]} />
      <LatestArticles>
        <BlockTitle>最近文章</BlockTitle>
        <LatestArticlesWrap>
          {latestPosts.map(({ node: post }, index) => <Article post={post} key={index} />)}
        </LatestArticlesWrap>
        <div>
          <Link to={ROUTES.ARTICLES}>
            阅读更多文章 >
          </Link>
        </div>
      </LatestArticles>
    </Layout>
  )
}

export default IndexPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(sort: { fields: [frontmatter___date], order: DESC }, limit: 5) {
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
