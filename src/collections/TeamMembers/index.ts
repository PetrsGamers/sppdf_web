import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { anyone } from '../../access/anyone'
import { revalidateTeamMember, revalidateTeamMemberDelete } from './hooks/revalidateTeamMember'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: {
    singular: 'Člen týmu',
    plural: 'Členové týmu',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Obsah webu',
    defaultColumns: ['name', 'role', 'order', 'photo'],
    useAsTitle: 'name',
    description:
      'Lidé zobrazení v bloku „Náš tým“ na stránce O nás. Řadí se podle pole Pořadí (od nejmenšího čísla). ' +
      'Když nebude zadaný nikdo, blok s týmem se skryje.',
    listSearchableFields: ['name', 'role'],
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Jméno a příjmení',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      label: 'Funkce',
      required: true,
      admin: {
        description: 'Např. „Předseda“, „Místopředsedkyně“, „PR koordinátorka“.',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Fotka',
      admin: {
        description:
          'Portrét, ideálně čtvercový (zobrazí se ve výřezu kruhu). Bez fotky se ukáže ikonka postavy.',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Pořadí',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description:
          'Menší číslo = víc vlevo / dřív. Např. předseda 1, místopředseda 2… Lidé se stejným číslem se řadí libovolně.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateTeamMember],
    afterDelete: [revalidateTeamMemberDelete],
  },
}
