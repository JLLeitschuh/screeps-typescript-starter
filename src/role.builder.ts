import {CreepSupport} from "./creep.support";

export class RoleBuilder {
  public static run(creep: Creep) {
    const isWorking = CreepSupport.workTransition(creep);

    if (isWorking) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        const targetsSorted = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        if (creep.build(targetsSorted[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targetsSorted[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
      }
    }
    else {
      CreepSupport.collectEnergy(creep);
    }
  }
}
