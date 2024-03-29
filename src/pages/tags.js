import React from 'react'
import { graphql } from 'gatsby'
import Link from 'common-styles/Link'
import Layout from 'components/Layout'
import Seo from 'components/SEO'
import TAGS_COLORS from 'constants/tags'
import ROUTES from 'constants/routes'

const { useState, useEffect } = React

const TagsPage = ({ data, location }) => {
  const [tagsMap, setTagsMap] = useState(new Map())
  const posts = data.allMdx.edges

  useEffect(() => {
    const map = new Map()
    for (const { node } of posts) {
      const tags = node.frontmatter.tags || []
      if (!tags.length) {
        continue
      }
      for (const tag of tags) {
        const originCount = map.get(tag) || 0
        map.set(tag, originCount + 1)
      }
    }
    setTagsMap(map)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout location={location}>
      <Seo title='Tags page' keywords={['FrontEnd Developer', 'React', 'Node', 'Gatsby']} />
      <div className='tags'>
        {Array.from(tagsMap).map(([tag, count], index) => {
          return (
            <span key={index} className={`tag ${TAGS_COLORS[tag]}`}>
              <Link to={`${ROUTES.TAGS}/${tag}`}>
                <strong>{`${tag} (${count})`}</strong>
              </Link>
            </span>
          )
        })}
      </div>
    </Layout>
  )
}

export default TagsPage

export const pageQuery = graphql`
  query {
    allMdx(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "YYYY-MM-DD")
            title
            description
            tags
          }
        }
      }
    }
  }
`
