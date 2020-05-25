import React from 'react'
import { Link, graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import styled from 'styled-components'

import SEO from 'components/SEO'
import Bio from 'components/Bio'
import Layout from 'components/Layout'
import Utterances from 'components/Utterances'
import Tags from 'components/Tags'
import { PageTitle } from 'common-styles/Title'
import { FlexCenter } from 'common-styles/Flex'
import { Date } from 'common-styles/PageInfo'
import { rhythm } from 'utils/typography'
import ROUTES from 'constants/routes'

const ArticleDate = styled(Date)`
  margin: 0.5em 0 1em;
`
const PrevNextWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2em 0;
  font-weight: bold;
`
const TagsWrap = styled.div`
  margin-left: 1em;
`

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.mdx
    const { title, tags: allTags } = post.frontmatter
    const tags = allTags || []

    const { readingTime } = post.fields

    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={title}
          description={post.frontmatter.description || post.excerpt}
        />
        <div className='box'>
          <FlexCenter>
            <PageTitle>{title}</PageTitle>
            <TagsWrap>
              <Tags tags={tags} />
            </TagsWrap>
          </FlexCenter>
          <ArticleDate>
            {post.frontmatter.date}&nbsp;
            <span>{`总共 ${readingTime.words} words, ${readingTime.text}`}</span>
          </ArticleDate>
          <MDXRenderer>{post.body}</MDXRenderer>
          <hr style={{ marginBottom: rhythm(0.8) }} />
          <Bio />

          <PrevNextWrap>
            <div>
              {previous && (
                <Link to={`${ROUTES.ARTICLES}${previous.fields.slug}`} rel='prev'>
                  {`上一篇: ${previous.frontmatter.title}`}
                </Link>
              )}
            </div>
            <div>
              {next && (
                <Link to={`${ROUTES.ARTICLES}${next.fields.slug}`} rel='next'>
                  {`下一篇: ${next.frontmatter.title}`}
                </Link>
              )}
            </div>
          </PrevNextWrap>

          <Utterances title={title} />
        </div>
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
      tableOfContents
      fields {
        slug
        readingTime {
          text
          words
        }
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
