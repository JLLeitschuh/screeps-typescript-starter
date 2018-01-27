import {CreepSupport} from "./creep.support";

export class RoleBuilder {
  public static run(creep: Creep) {
    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
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
