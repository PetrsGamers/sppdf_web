import * as migration_20260321_130031_add_team_members from './20260321_130031_add_team_members';

export const migrations = [
  {
    up: migration_20260321_130031_add_team_members.up,
    down: migration_20260321_130031_add_team_members.down,
    name: '20260321_130031_add_team_members'
  },
];
