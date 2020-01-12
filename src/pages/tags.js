import React from 'react'
import Layout from 'components/Layout'
import SEO from 'components/SEO'
import TAGS_COLORS from 'constants/tags'

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
      <SEO title='Tags page' keywords={['FrontEnd Developer', 'React', 'Node', 'Gatsby']} />
      <div className='tags'>
        {Array.from(tagsMap).map(([tag, count], index) => {
          return (
            <span key={index} className={`tag ${TAGS_COLORS[tag]}`}>
              <strong>{`${tag} (${count})`}</strong>
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
