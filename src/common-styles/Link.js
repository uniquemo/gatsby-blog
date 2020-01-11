import { Link } from 'gatsby'
import styled from 'styled-components'
import COLORS from '../constants/colors'

const StyledLink = styled(Link)`
  color: inherit;

  &:hover {
    color: ${COLORS.FONT_PRIMARY};
  }
`

export const ButtonLink = styled(Link)`
  padding: 0.3em 0.5em;
  border: 1px solid ${COLORS.FONT_GREY};
  border-radius: 2px;
  box-shadow: none;
  font-size: 0.75rem;
  color: ${COLORS.FONT_GREY};
  text-decoration: none;

  &:hover {
    border: 1px solid ${COLORS.FONT_PRIMARY};
    color: ${COLORS.FONT_PRIMARY};
  }
`

export default StyledLink
