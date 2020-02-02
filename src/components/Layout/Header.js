import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'
import styled from 'styled-components'
import Link from 'common-styles/Link'
import { FlexCenter } from 'common-styles/Flex'

import ROUTES from 'constants/routes'
import COLORS from 'constants/colors'

const Root = styled.div`
  width: 100%;
  min-width: 1200px;
  position: fixed;
  z-index: 10;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

  & a {
    color: ${props => props.isActive ? COLORS.FONT_PRIMARY : COLORS.FONT_GREY};
  }
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
    label: 'Tags',
    route: ROUTES.TAGS
  },
  {
    label: 'About',
    route: ROUTES.ABOUT
  }
]

const Header = ({ location }) => {
  const { avatar, githubLogo, site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            social {
              github
            }
          }
        }
        avatar: file(absolutePath: { regex: "/profile-pic.jpeg/" }) {
          childImageSharp {
            fixed(width: 50, height: 50) {
              ...GatsbyImageSharpFixed
            }
          }
        }
        githubLogo: file(absolutePath: { regex: "/github-logo.png/" }) {
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
      <FlexCenter>
        <Image fixed={avatar.childImageSharp.fixed} />
        <BlogTitle>莫泳欣的博客</BlogTitle>
        <BannerWrap>
          {BANNERS.map(({ label, route }) => {
            const isActive =
              (route === ROUTES.HOME && location.pathname === ROUTES.HOME) ||
              (route !== ROUTES.HOME && location.pathname.startsWith(route))
            return (
              <BannerItem key={label} isActive={isActive}>
                <Link to={route}>
                  <strong>{label}</strong>
                </Link>
              </BannerItem>
            )
          })}
        </BannerWrap>
      </FlexCenter>
      <a href={site.siteMetadata.social.github} target='__blank'>
        <Image fixed={githubLogo.childImageSharp.fixed} />
      </a>
    </Root>
  )
}

export default Header
