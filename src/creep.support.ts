import {Role} from "./role";

export class CreepSupport {
  public static collectEnergy(creep: Creep) {
    // TODO: Filter out energy
    const energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {range: 1});

    if (energy) {
      // console.log('found ' + energy.amount + ' energy at ', energy.pos);
      if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
        creep.moveTo(energy, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
  }

  public static creepsByRole(role: Role): Creep[] {
    return _.filter(Game.creeps, (creep) => creep.memory["role"] == role);
  }
}
