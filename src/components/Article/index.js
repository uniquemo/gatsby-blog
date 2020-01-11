import React from 'react'
import styled from 'styled-components'
import Link, { ButtonLink } from '../../common-styles/Link'
import COLORS from '../../constants/colors'
import { PATHS } from '../../constants/routes'

const Root = styled.div`
  padding: 1.25rem;
  margin-bottom: 1em;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 3px rgba(150, 150, 150, 0.1), 0 0 0 1px rgba(150, 150, 150, 0.1);
`
const Header = styled.div`
  display: flex;
  align-items: center;
`
const ArticleTitle = styled.div`
  margin-right: 1em;
  color: ${COLORS.FONT_BLACK};

  &:hover {
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
    <Root>
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
        <ButtonLink to={postLink}>
          继续阅读 >
        </ButtonLink>
      </div>
    </Root>
  )
}

export default Article
