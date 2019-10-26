import { getSystemLogger } from '../logger'
import { withValidatedBodyInner } from './withValidatedBody'

export const withValidatedBody = withValidatedBodyInner(getSystemLogger())
