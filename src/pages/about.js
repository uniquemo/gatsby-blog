import React from 'react'
import Layout from '../components/Layout'
import SEO from '../components/SEO1'

const AboutPage = ({ location }) => {
  return (
    <Layout location={location}>
      <SEO title='About page' keywords={['FrontEnd Developer', 'React', 'Node', 'Gatsby']} />
      <div>to do</div>
    </Layout>
  )
}

export default AboutPage
