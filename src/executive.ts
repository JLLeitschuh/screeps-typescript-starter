/**
 * Manages controlling a room.
 */
import {RoomElements} from "./room.elements";
import {Role} from "./role";
import {CreepSupport} from "./creep.support";

export class Executive {
  private room: Room;
  private elements: RoomElements;

  private constructor(room: Room) {
    this.room = room;
    this.elements = RoomElements.from(room);
  }

  public spawnQueue() {

    const harvesters = CreepSupport.creepsByRole(Role.HARVESTER);

    const upgraders = CreepSupport.creepsByRole(Role.UPGRADER);

    const builders = CreepSupport.creepsByRole(Role.BUILDER);

    const guards = CreepSupport.creepsByRole(Role.GUARD);

    const dropMiners = CreepSupport.creepsByRole(Role.DROP_MINER);

    const constructionSiteCount = this.elements.constructionSites.length;
    const requiredBuilders = Math.ceil(constructionSiteCount / 2);

    if (dropMiners.length < this.elements.sources.length) {
      // First priority, spawn dropminers
      this.spawnCreepOfType(Role.DROP_MINER);
    } else if (harvesters.length < 3) {
      // Second priority, spawn haulers,
      this.spawnCreepOfType(Role.HARVESTER)
    } else if (upgraders.length < 3) {
      // Third priority, spawn upgrader.
      this.spawnCreepOfType(Role.UPGRADER)
    } else if (builders.length < requiredBuilders) {
      // Fourth priority, spawn builders.
      this.spawnCreepOfType(Role.BUILDER)
    } else if (guards.length < 1) {
      // Fifth priority, spawn guard.
      this.spawnCreepOfType(Role.GUARD);
    } else {
      // Sixth priority, spawn a claimer.
    }
  }

  private spawnCreepOfType(role: Role): void {
    for (const spawn of this.elements.spawns) {
      if (spawn.spawning) {
        // Don't spawn another creep while one is being spawned.
        continue;
      }
      const capitalizedRole = Executive.capitalizeFirstLetter(role);
      const newName = capitalizedRole + String(Game.time);
      console.log('Spawning new ' + role + ': ' + newName);
      spawn.spawnCreep(this.bodyFor(role), newName,
        {memory: {role: role}});
      // Only spawn once per room!
      return;
    }
  }

  private static capitalizeFirstLetter(string: String): String {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * From: http://screeps.wikia.com/wiki/Creep
   * |=======================|
   * | Part           | Cost |
   * |=======================|
   * | MOVE           |    50|
   * | WORK           |   100|
   * | CARRY          |    50|
   * | ATTACK         |    80|
   * | RANGED_ATTACK  |   150|
   * | HEAL           |   250|
   * | TOUGH          |    10|
   * | CLAIM          |   600|
   * |=======================|
   *
   * From: http://docs.screeps.com/api/#StructureExtension
   * |======================================================|
   * | Ctl Lvl. | Ext Cnt. | Capacity/Ext. | Total Capacity |
   * |======================================================|
   * |        1 |        - |             - |            300 |
   * |        2 |        5 |            50 |            550 |
   * |        3 |       10 |            50 |            800 |
   * |        4 |       20 |            50 |           1300 |
   * |        5 |       30 |            50 |           1800 |
   * |        6 |       40 |            50 |           2300 |
   * |        7 |       50 |           100 |           5300 |
   * |        8 |       60 |           200 |          12300 |
   * |======================================================|
   */
  private bodyFor(role: Role): BodyPartConstant[] {
    if (role == Role.GUARD) {
      return [ATTACK, ATTACK, MOVE]; // 210 Energy
    }
    // TODO: Make this vary based upon the actually available resources.
    if (this.room.energyAvailable <= 300) {
      // If we don't have the energy available, then we need to resort to making cheaper creeps.
      switch(role) {
        case Role.DROP_MINER:
          return [WORK, WORK, MOVE]; // 250 Energy
        default:
          return [WORK, CARRY, MOVE]; // 200 Energy
      }
    }
    switch (role) {
      case Role.DROP_MINER:
        return [WORK, WORK, WORK, WORK, WORK, MOVE]; // 550 Energy
      default:
        return [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; // 550 Energy
    }
  }

  /**
   * Instantiate an Executive.
   * @param {Room} room The room to wrap with the executive.
   * @returns {Executive} The executive wrapping the room.
   */
  public static from(room: Room): Executive {
    return new Executive(room);
  }
}

