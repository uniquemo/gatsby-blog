/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import styled from 'styled-components'

import { FlexCenter } from 'common-styles/Flex'
import { rhythm } from 'utils/typography'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Bio = () => {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author, social } = data.site.siteMetadata
        const img = getImage(data.avatar);
        return (
          <Container>
            <FlexCenter>
              <GatsbyImage
                image={img}
                alt={author}
                style={{
                  marginRight: rhythm(1 / 2),
                  marginBottom: 0,
                  minWidth: 50,
                  borderRadius: `100%`,
                }}
                imgStyle={{
                  borderRadius: `50%`,
                }}
              />
              <div>
                Written by <strong>{author}</strong>
                <div>Do some lovely things, write some code~</div>
              </div>
            </FlexCenter>
            <a href={social.github} target='__blank'>
              <button className='button is-danger is-small'>Follow</button>
            </a>
          </Container>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile-pic.jpeg/" }) {
      childImageSharp {
        gatsbyImageData(
          width: 50
          height: 50
        )
      }
    }
    site {
      siteMetadata {
        author
        social {
          github
        }
      }
    }
  }
`

export default Bio
