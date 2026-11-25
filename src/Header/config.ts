import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

import { link } from '@/fields/link'
import { templateAdmin } from '@/utilities/templateAdmin'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
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
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
