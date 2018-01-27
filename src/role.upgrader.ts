import {CreepSupport} from "./creep.support";

export class RoleUpgrader {
  public static run(creep: Creep) {
    if (creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
      const controller = creep.room.controller;
      if (controller == null) {
        return
      }
      if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
      }
    }
    else {
      CreepSupport.collectEnergy(creep);
    }
  }
}
