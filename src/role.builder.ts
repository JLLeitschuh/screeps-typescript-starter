import {CreepSupport} from "./creep.support";

export class RoleBuilder {
  public static MAX_STRUCTURE_HEALTH = 50000;

  public static run(creep: Creep) {
    const isWorking = CreepSupport.workTransition(creep);

    if (isWorking) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        const targetsSorted = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        if (creep.build(targetsSorted[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targetsSorted[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
      } else {
        const structures = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) &&
              structure.hits < structure.hitsMax;
          }
        }) as OwnedStructure[];
        if (structures.length) {
          // If there are walls.
          const hits = structures.map(structure => structure.hits);
          const average = hits.reduce((previous, current) => current + previous) / hits.length;
          const targetAverage = average + 20;
          const structureSorted =
            _.sortBy(
              _.filter(
                structures,
                structure => structure.hits <= targetAverage && structure.hits <= RoleBuilder.MAX_STRUCTURE_HEALTH),
              'hits');
          if (structureSorted.length) {
            const wallToFix = structureSorted[0];
            if (creep.repair(wallToFix) == ERR_NOT_IN_RANGE) {
              creep.moveTo(wallToFix, {visualizePathStyle: {stroke: '#ffffff'}});
            }
          }
        }
      }
    }
    else {
      CreepSupport.collectEnergy(creep);
    }
  }
}
