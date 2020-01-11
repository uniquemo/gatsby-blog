import React from 'react'
import styled from 'styled-components'
import Link from '../../common-styles/Link'

import ROUTES from '../../constants/routes'
import COLORS from '../../constants/colors'

const Root = styled.div`
  display: flex;
  align-items: center;
  padding: 1.2em 10em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`
const BlogTitle = styled.div`
  margin-right: 2em;
  font-weight: bold;
  font-size: 1.2em;
  color: ${COLORS.FONT_BLACK};
`
const BannerWrap = styled.div`
  display: flex;
  flex-direction: row;
`
const BannerItem = styled.div`
  margin-right: 2em;
`

const BANNERS = [
  {
    label: 'Home',
    route: ROUTES.HOME
  },
  {
    label: 'Articles',
    route: ROUTES.ARTICLES
  },
  {
    label: 'Archives',
    route: ROUTES.ARCHIVES
  },
  {
    label: 'About',
    route: ROUTES.ABOUT
  }
]

const Header = () => {
  return (
    <Root>
      <BlogTitle>莫泳欣的博客</BlogTitle>
      <BannerWrap>
        {BANNERS.map(({ label, route }) => {
          return (
            <BannerItem key={label}>
              <Link to={route}>
                <span>{label}</span>
              </Link>
            </BannerItem>
          )
        })}
      </BannerWrap>
    </Root>
  )
}

export default Header
