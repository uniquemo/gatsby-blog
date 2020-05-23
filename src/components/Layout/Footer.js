import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import styled from 'styled-components'

import COLORS from 'constants/colors'

const Root = styled.div`
  padding: 2em 0;
  border-top: 1px solid #eceff2;
  text-align: center;
  background-color: ${COLORS.GREY};
`

const Footer = () => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            author
          }
        }
      }
    `
  )

  const { author } = site.siteMetadata

  return (
    <Root>
      © {new Date().getFullYear()} {author}<br />
      Powered by <a href='https://www.gatsbyjs.org/' target='__blank'>Gatsby</a>
    </Root>
  )
}

export default Footer
