import type { TextField } from 'payload'

/**
 * Material Symbols icon name. Kept as a plain text field (not a select) so existing values
 * in the database stay valid.
 */
export const iconField = ({
  name = 'icon',
  label = 'Ikona',
  required = true,
  defaultValue,
}: {
  name?: string
  label?: string
  required?: boolean
  defaultValue?: string
} = {}): TextField => ({
  name,
  type: 'text',
  label,
  ...(required ? { required } : {}),
  ...(defaultValue !== undefined ? { defaultValue } : {}),
  admin: {
    description:
      'Anglický název ikony ze sady Material Symbols, malými písmeny a s podtržítky ' +
      '(např. groups, celebration, school, photo_camera, mail). ' +
      'Všechny ikony najdete na https://fonts.google.com/icons – klikněte na ikonu a zkopírujte její název.',
  },
})
