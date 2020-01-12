import React from 'react'
import styled from 'styled-components'
import Link from 'common-styles/Link'
import COLORS from 'constants/colors'
import { PATHS } from 'constants/routes'

const Header = styled.div`
  display: flex;
  align-items: center;
`
const ArticleTitle = styled.div`
  margin-right: 1em;
  color: ${COLORS.FONT_BLACK};

  & a:hover {
    color: ${COLORS.FONT_PRIMARY};
  }
`
const Content = styled.div`
  padding: 1em 0;
`

const Article = ({ post }) => {
  const title = post.frontmatter.title || post.fields.slug
  const postLink = `${PATHS.ARTICLES}${post.fields.slug}`

  return (
    <div className='box'>
      <Header>
        <ArticleTitle>
          <Link to={postLink}>
            <strong>{title}</strong>
          </Link>
        </ArticleTitle>
        <div>{post.frontmatter.date}</div>
      </Header>
      <Content>{post.frontmatter.description || post.excerpt}</Content>
      <div>
        <Link to={postLink}>
          <button className='button is-small'>
            继续阅读 >
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Article
