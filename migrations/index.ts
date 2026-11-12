import * as migration_20261112_202435_baseline from './20261112_202435_baseline'
import * as migration_20261112_204942_release_content_and_payload_3_93 from './20261112_204942_release_content_and_payload_3_93'

export const migrations = [
  {
    up: migration_20261112_202435_baseline.up,
    down: migration_20261112_202435_baseline.down,
    name: '20261112_202435_baseline',
  },
  {
    up: migration_20261112_204942_release_content_and_payload_3_93.up,
    down: migration_20261112_204942_release_content_and_payload_3_93.down,
    name: '20261112_204942_release_content_and_payload_3_93',
  },
]
