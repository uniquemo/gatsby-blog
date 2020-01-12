import React from 'react'
import styled from 'styled-components'
import Link from 'common-styles/Link'
import { FlexCenter } from 'common-styles/Flex'
import { Date } from 'common-styles/PageInfo'
import Tags from 'components/Tags'
import COLORS from 'constants/colors'
import { PATHS } from 'constants/routes'

const Header = styled.div`
  display: flex;
  flex-direction: column;
`
const ArticleTitle = styled.div`
  margin-right: 1em;
  color: ${COLORS.FONT_BLACK};

  & a:hover {
    color: ${COLORS.FONT_PRIMARY};
  }
`
const ArticleDate = styled(Date)`
  margin-top: 0.5em;
`
const Content = styled.div`
  padding: 0.8em 0;
`

const Article = ({ post, showTags }) => {
  const title = post.frontmatter.title || post.fields.slug
  const postLink = `${PATHS.ARTICLES}${post.fields.slug}`
  const tags = post.frontmatter.tags || []

  return (
    <div className='box'>
      <Header>
        <FlexCenter>
          <ArticleTitle>
            <Link to={postLink}>
              <strong>{title}</strong>
            </Link>
          </ArticleTitle>
          {showTags && <Tags tags={tags} />}
        </FlexCenter>
        {<ArticleDate>{post.frontmatter.date}</ArticleDate>}
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
