import React from 'react'
import { Link, graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import styled from 'styled-components'

import SEO from 'components/SEO'
import Bio from 'components/Bio'
import Layout from 'components/Layout'
import { PageTitle } from 'common-styles/Title'
import { rhythm } from 'utils/typography'
import { PATHS } from 'constants/routes'

const PrevNextWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2em 0;
  font-weight: bold;
`
const Content = styled.div`
  margin-top: 1em;
`

const ReviewPostTemplate = props => {
  const post = props.data.mdx
  const { title } = post.frontmatter

  const siteTitle = props.data.site.siteMetadata.title
  const { previous, next } = props.pageContext

  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO title={title} description={post.frontmatter.description || post.excerpt} />
      <div className='box'>
        <PageTitle>{title}</PageTitle>
        <Content>
          <MDXRenderer>{post.body}</MDXRenderer>
        </Content>
        <hr style={{ marginBottom: rhythm(0.8) }} />
        <Bio />

        <PrevNextWrap>
          <div>
            {previous && (
              <Link to={`${PATHS.REVIEWS}${previous.fields.slug}`} rel='prev'>
                {`上一篇: ${previous.frontmatter.title}`}
              </Link>
            )}
          </div>
          <div>
            {next && (
              <Link to={`${PATHS.REVIEWS}${next.fields.slug}`} rel='next'>
                {`下一篇: ${next.frontmatter.title}`}
              </Link>
            )}
          </div>
        </PrevNextWrap>
      </div>
    </Layout>
  )
}

export default ReviewPostTemplate

export const pageQuery = graphql`
  query ReviewPostBySlug($slug: String!) {
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
