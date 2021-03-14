import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image';
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

const RSS = styled.div`
  width: 38px;
  height: 38px;
  line-height: 40px;
  border-radius: 50%;
  background-color: #f15d5d;
  font-size: 0.9em;
  font-weight: bold;
  color: #fff;
  text-align: center;
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
    label: 'Reviews',
    route: ROUTES.REVIEWS
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
            author
            siteUrl
            social {
              github
            }
          }
        }
        avatar: file(absolutePath: { regex: "/profile-pic.jpeg/" }) {
          childImageSharp {
            gatsbyImageData(
              width: 50
              height: 50
            )
          }
        }
        githubLogo: file(absolutePath: { regex: "/github-logo.png/" }) {
          childImageSharp {
            gatsbyImageData(
              width: 50
              height: 50
            )
          }
        }
      }
    `
  )

  const { social, siteUrl, author } = site.siteMetadata

  return (
    <Root>
      <FlexCenter>
        <GatsbyImage image={avatar.childImageSharp.gatsbyImageData} alt='avatar' />
        <BlogTitle>{author}的博客</BlogTitle>
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
      <FlexCenter>
        <a href={social.github} target='__blank'>
          <GatsbyImage image={githubLogo.childImageSharp.gatsbyImageData} alt='github' />
        </a>
        <a href={`${siteUrl}/rss.xml`} target='__blank'>
          <RSS>RSS</RSS>
        </a>
      </FlexCenter>
    </Root>
  )
}

export default Header
