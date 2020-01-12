import { Link } from 'gatsby'
import styled from 'styled-components'
import COLORS from 'constants/colors'

const StyledLink = styled(Link)`
  color: inherit;

  &:hover {
    color: ${COLORS.FONT_PRIMARY};
  }
`

export default StyledLink
