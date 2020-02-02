import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'
import { FlexCenter } from 'common-styles/Flex'

const Root = styled(FlexCenter)`
  padding: 1em 0;
`
const Crumb = styled.span`
  font-weight: bold;
`
const Slash = styled.span`
  padding: 0 0.8em;
`

const { useState, useEffect } = React

const BreadCrumbs = ({ location }) => {
  const [crumbs, setCrumbs] = useState([])

  useEffect(() => {
    const { pathname } = location
    const paths = decodeURIComponent(pathname).split('/').filter(p => p)
    const pathObjs = []

    paths.forEach((p, index) => {
      pathObjs.push({
        label: p,
        route: `/${paths.slice(0, index + 1).join('/')}`
      })
    })

    if (!pathObjs.length) {
      pathObjs.push({
        label: 'home',
        route: '/'
      })
    }

    setCrumbs(pathObjs)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const len = crumbs.length

  return (
    <Root>
      {crumbs.map(({ label, route }, index) => {
        const isLastCrumb = index === len - 1
        return (
          <div key={index}>
            <Crumb isLastCrumb={isLastCrumb}>
              <Link to={route}>
                {label}
              </Link>
            </Crumb>
            {!isLastCrumb ? <Slash>/</Slash> : null}
          </div>
        )
      })}
    </Root>
  )
}

export default BreadCrumbs
