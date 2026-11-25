import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrNone } from '../access/authenticatedOrNone'
import { slugField } from 'payload'
import { templateAdmin } from '@/utilities/templateAdmin'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrNone,
    update: authenticated,
  },
  admin: {
    ...templateAdmin,
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
