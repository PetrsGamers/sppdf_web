import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateMedia, revalidateMediaDelete } from '../hooks/revalidateMedia'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Obrázek / soubor',
    plural: 'Obrázky a soubory',
  },
  folders: true,
  admin: {
    group: 'Obsah webu',
    description:
      'Všechny nahrané fotky a soubory. Obrázek nahrajte sem, nebo rovnou u pole „Obrázek“ na konkrétní stránce. ' +
      'Smazaný obrázek zmizí ze všech stránek, kde byl použitý.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Popis obrázku (alt)',
      //required: true,
      admin: {
        description:
          'Krátce popište, co je na obrázku (např. „Členové spolku na vánočním večírku“). ' +
          'Přečte ho hlasová čtečka pro nevidomé a Google; zobrazí se i tehdy, když se obrázek nenačte.',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Popisek',
      admin: { description: 'Na hlavních stránkách webu se nepoužívá.' },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  hooks: {
    afterChange: [revalidateMedia],
    afterDelete: [revalidateMediaDelete],
  },
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
