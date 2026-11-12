import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { TeamMember } from '../../../payload-types'

export const revalidateTeamMember: CollectionAfterChangeHook<TeamMember> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating /aboutus for team member: ${doc.name}`)
    revalidatePath('/aboutus')
  }
  return doc
}

export const revalidateTeamMemberDelete: CollectionAfterDeleteHook<TeamMember> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath('/aboutus')
  }
  return doc
}
