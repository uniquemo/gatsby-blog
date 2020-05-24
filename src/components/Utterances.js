import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

const Utterances = React.memo(({ title }) => {
  const utterancesRef = useRef()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const el = document.createElement('script')
    el.src = 'https://utteranc.es/client.js'
    el.async = true
    el.setAttribute('repo', 'uniquemo/gatsby-blog')
    el.setAttribute('issue-term', title)
    el.setAttribute('label', 'Comment')
    el.setAttribute('theme', 'github-light')
    el.setAttribute('crossorigin', 'anonymous')

    if (utterancesRef.current) {
      utterancesRef.current.appendChild(el)
    }

    return () => {
      el.remove()
    }
  }, [title])

  return <section key={title} className='section' ref={utterancesRef} />
})

Utterances.propTypes = {
  title: PropTypes.string.isRequired
}

export default Utterances
