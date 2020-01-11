import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'
import styled from 'styled-components'
import Link from '../../common-styles/Link'

import ROUTES from '../../constants/routes'
import COLORS from '../../constants/colors'

const Root = styled.div`
  width: 100%;
  position: fixed;
  z-index: 10;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0.6em 10em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`
const BlogTitle = styled.div`
  margin: 0 2em 0 0.5em;
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
  const { avatar } = useStaticQuery(
    graphql`
      query {
        avatar: file(absolutePath: { regex: "/profile-pic.jpeg/" }) {
          childImageSharp {
            fixed(width: 50, height: 50) {
              ...GatsbyImageSharpFixed
            }
          }
        }
      }
    `
  )

  return (
    <Root>
      <Image fixed={avatar.childImageSharp.fixed} />
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
