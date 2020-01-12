import React from 'react'
import styled from 'styled-components'

import COLORS from 'constants/colors'

const Root = styled.div`
  padding: 2em 0;
  border-top: 1px solid #eceff2;
  text-align: center;
  background-color: ${COLORS.GREY};
`

const Footer = () => {
  return (
    <Root>
      © {new Date().getFullYear()} 莫泳欣<br />
      Powered by <a href='https://www.gatsbyjs.org/' target='__blank'>Gatsby</a>
    </Root>
  )
}

export default Footer
