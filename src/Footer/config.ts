import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

import { link } from '@/fields/link'
import { templateAdmin } from '@/utilities/templateAdmin'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: authenticated,
  },
  admin: templateAdmin,
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
