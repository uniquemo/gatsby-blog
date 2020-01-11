import React from 'react'
import styled from 'styled-components'

const Icon = styled.div`
  position: fixed;
  bottom: 3em;
  right: 2em;
  width: 2.5em;
  height: 2.5em;
  line-height: 2em;
  text-align: center;
  border-radius: 2px;
  color: #fff;
  background-color: rgba(50, 115, 220, 0.7);
  cursor: pointer;

  &:hover {
    background-color: rgba(50, 115, 220, 1);
  }
`

const { useState, useEffect } = React

const ScrollToTop = () => {
  const [showIcon, setShowIcon] = useState(false)

  const handleScroll = () => {
    if (window.scrollY > 450) {
      setShowIcon(true)
    } else {
      setShowIcon(false)
    }
  }

  const handleScroll2Top = () => window.scrollTo(0, 0)

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return showIcon && (
    <Icon onClick={handleScroll2Top}>
      ↑
    </Icon>
  )
}

export default ScrollToTop
