import React from 'react'
import randomUtils from 'utils/random'

const Tags = ({ tags = [] }) => {
  return (
    <div className='tags'>
      {tags.map((tag, index) => (
        <span key={index} className={`tag ${randomUtils.genRandomTag(index)}`}>
          <strong>{tag}</strong>
        </span>
      ))}
    </div>
  )
}

export default Tags
