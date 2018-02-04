import {CreepSupport} from "./creep.support";

export class RoleUpgrader {
  public static run(creep: Creep) {
    const isWorking = CreepSupport.workTransition(creep);

    if (isWorking) {
      const controller = creep.room.controller;
      if (controller == null) {
        return
      }
      if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
        CreepSupport.moveCreep(creep, controller);
      }
    } else {
      CreepSupport.collectEnergy(creep);
    }
  }
}
