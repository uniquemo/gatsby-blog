import React from 'react'
import styled from 'styled-components'
import Header from './Header'
import Footer from './Footer'
import BreadCrumbs from './BreadCrumbs'
import ScrollToTop from '../ScrollToTop'

import COLORS from '../../constants/colors'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font: 16px "open sans", "Helvetica Neue", "Microsoft Yahei", Helvetica, Arial, sans-serif;
  color: ${COLORS.FONT_GREY};
`
const Content = styled.div`
  padding: 0 10em 2em;
  margin-top: 70px;
  flex: 1;
  background-color: ${COLORS.GREY};
`

const Layout = ({ children, location }) => {
  return (
    <Root>
      <Header location={location} />
      <Content>
        <BreadCrumbs location={location} />
        {children}
      </Content>
      <Footer />
      <ScrollToTop />
    </Root>
  )
}

export default Layout
