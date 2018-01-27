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

    if (dropMiners.length < this.elements.spawns.length) {
      // First priority, spawn dropminers
      this.spawnCreepOfType(Role.DROP_MINER);
    } else if (harvesters.length < 3) {
      // Second priority, spawn haulers,
      this.spawnCreepOfType(Role.HARVESTER)
    } else if (upgraders.length < 2) {
      // Third priority, spawn upgrader.
      this.spawnCreepOfType(Role.UPGRADER)
    } else if (builders.length < 4) {
      // Fourth priority, spawn builders.
      this.spawnCreepOfType(Role.BUILDER)
    } else if (guards.length < 1) {
      // Fifth priority, spawn guard.
      this.spawnCreepOfType(Role.GUARD);
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
   */
  private bodyFor(role: Role): BodyPartConstant[] {
    // TODO: Make this vary based upon the actually available resources.
    if (this.room.energyAvailable == 300) {
      if (role == Role.DROP_MINER) {
        return [WORK, WORK, MOVE];
      }
    }
    switch (role) {
      case Role.DROP_MINER:
        return [WORK, WORK, WORK, WORK, WORK, MOVE];
      case Role.GUARD:
        return [ATTACK, ATTACK, MOVE];
      default:
        return [WORK, CARRY, MOVE];
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

