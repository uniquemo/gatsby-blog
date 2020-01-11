import React from 'react'
import { Link, graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import styled from 'styled-components'

import Bio from '../components/bio'
import Layout from '../components/Layout'
import SEO from '../components/seo'
import Utterances from '../components/Utterances'
import { PageTitle } from '../common-styles/Title'
import { rhythm } from '../utils/typography'
import { PATHS } from '../constants/routes'

const ArticleRoot = styled.div`
  padding: 1.5em 2em;
  background-color: #fff;
`
const ArticleDate = styled.div`
  margin: 0.5em 0 2em;
`
const PrevNextWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2em 0;
`

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.mdx
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <ArticleRoot>
          <PageTitle>{post.frontmatter.title}</PageTitle>
          <ArticleDate>{post.frontmatter.date}</ArticleDate>
          <MDXRenderer>{post.body}</MDXRenderer>
          <hr style={{ marginBottom: rhythm(0.8) }} />
          <Bio />

          <PrevNextWrap>
            <div>
              {previous && (
                <Link to={`${PATHS.ARTICLES}${previous.fields.slug}`} rel='prev'>
                  {`上一篇: ${previous.frontmatter.title}`}
                </Link>
              )}
            </div>
            <div>
              {next && (
                <Link to={`${PATHS.ARTICLES}${next.fields.slug}`} rel='next'>
                  {`下一篇: ${next.frontmatter.title}`}
                </Link>
              )}
            </div>
          </PrevNextWrap>

          <Utterances title={post.frontmatter.title} />
        </ArticleRoot>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
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
      }
    }
  }
`
