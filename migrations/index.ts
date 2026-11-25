import * as migration_20261112_202435_baseline from './20261112_202435_baseline';
import * as migration_20261112_204942_release_content_and_payload_3_93 from './20261112_204942_release_content_and_payload_3_93';
import * as migration_20261125_190446_facebook_event_id from './20261125_190446_facebook_event_id';

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
  {
    up: migration_20261125_190446_facebook_event_id.up,
    down: migration_20261125_190446_facebook_event_id.down,
    name: '20261125_190446_facebook_event_id'
  },
];
