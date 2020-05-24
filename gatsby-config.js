module.exports = {
  siteMetadata: {
    title: `Momo's blog`,
    author: `unique.mo`,
    description: `A personal blog powered by gatsby, styled components.`,
    siteUrl: `http://47.115.57.59:8001`,
    social: {
      github: `https://github.com/uniquemo/gatsby-blog`,
    },
  },
  plugins: [
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-sass`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    //`gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    `gatsby-remark-reading-time`,
    {
      resolve: `gatsby-plugin-feed-mdx`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.edges.map(edge => {
                const { fields, excerpt, frontmatter, html } = edge.node
                const { layout, date } = frontmatter
                const URL_MAP = {
                  'blog-post': '/articles',
                  'review-post': '/reviews',
                  'about-page': ''
                }
                const url = `${site.siteMetadata.siteUrl}${URL_MAP[layout] || ''}${fields.slug}`
                return Object.assign({}, frontmatter, {
                  description: excerpt,
                  date,
                  url,
                  guid: url,
                  custom_elements: [{ 'content:encoded': html }]
                });
              });
            },
            query: `
              {
                allMdx(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                        layout
                      }
                    }
                  }
                }
              }
            `,
            output: `/rss.xml`,
            title: 'unique.mo的博客',
            // optional configuration to insert feed reference in pages:
            // if `string` is used, it will be used to create RegExp and then test if pathname of
            // current page satisfied this regular expression;
            // if not provided or `undefined`, all pages will have feed reference inserted
            // match: `^/articles`
          }
        ]
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/review`,
        name: `review`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/static`,
        name: `static`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [".mdx", ".md"],
        tableOfContents: {
          heading: null,
          maxDepth: 6,
        },
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: `gatsby-remark-vscode`,
            options: {
              colorTheme: 'Monokai'
            }
          },
          {
            resolve: `gatsby-remark-copy-linked-files`,
          },
          {
            resolve: `gatsby-remark-smartypants`,
          },
          {
            resolve: `gatsby-remark-autolink-headers`,
          },
          {
            resolve: 'gatsby-remark-toc',
            options: {
              header: 'Table of Contents',
              include: [
                'content/**/*.md'
              ]
            }
          }
        ],
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // edit below
        // trackingId: `ADD YOUR TRACKING ID HERE`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Momo's Blog`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/profile-pic.jpeg`,
      },
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
