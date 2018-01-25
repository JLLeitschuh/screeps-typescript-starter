export class RoleHarvester {
  public static run(creep: Creep) {
    if (creep.carry.energy < creep.carryCapacity) {
      const sources = creep.room.find(FIND_SOURCES);
      if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    } else {
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
          creep.moveTo(targetsSorted[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
      } else if (creep.carry.energy == creep.carryCapacity) {
        const targetPosition = creep.room.getPositionAt(36, 36);
        if (targetPosition != null) {
          creep.moveTo(targetPosition);
        }
      }
    }
  }
}

