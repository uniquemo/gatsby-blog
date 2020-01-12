import React from 'react'
import Layout from 'components/Layout'
import SEO from 'components/SEO'
import Utterances from 'components/Utterances'

const AboutPage = ({ location }) => {
  return (
    <Layout location={location}>
      <SEO title='About page' keywords={['FrontEnd Developer', 'React', 'Node', 'Gatsby']} />
      <div className='box'>
        <div className='title is-5'>关于本博客</div>
        <div>
          本博客基于 React 框架
          <a href='https://gatsbyjs.org' target='__blank'>{` GatsbyJS `}</a>
          搭配
          <a href='https://graphql.org/' target='__blank'>{` GraphQL `}</a>
          开发，使用
          <a href='https://www.netlifycms.org/' target='__blank'>{` Netlify CMS `}</a>
          管理文章内容并托管在
          <a href='https://www.netlify.com/' target='__blank'>{` Netlify `}</a>
          平台上。
        </div>
      </div>
      <div className='box'>
        <div className='title is-5'>关于我</div>
        <div>我是一名前端开发工程师，写博客是为了记录自己的学习足迹，如果我的文章能够帮助到你那就更好了！</div>
      </div>

      <Utterances title={`My Blog's About Page`} />
    </Layout>
  )
}

export default AboutPage
