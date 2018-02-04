import {CreepSupport} from "./creep.support";

export class RoleHarvester {
  public static run(creep: Creep) {
    const isWorking = CreepSupport.workTransition(creep);

    if (isWorking) {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
      });
      if(targets.length > 0) {
        const targetsSorted = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        if(creep.transfer(targetsSorted[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          CreepSupport.moveCreep(creep, targetsSorted[0]);
        }
      }
    } else {
      CreepSupport.collectEnergy(creep);
    }
  }
}

