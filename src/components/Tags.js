import React from 'react'
import TAGS_COLORS from 'constants/tags'

const Tags = ({ tags = [] }) => {
  return (
    <div className='tags'>
      {tags.map((tag, index) => (
        <span key={index} className={`tag ${TAGS_COLORS[tag]}`}>
          <strong>{tag}</strong>
        </span>
      ))}
    </div>
  )
}

export default Tags
