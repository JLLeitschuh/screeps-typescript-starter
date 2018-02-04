/**
 * Manages controlling a room.
 */
import {RoomElements} from "./room.elements";
import {Role} from "./role";
import {CreepSupport} from "./creep.support";
import {CreepBuilder} from "./creep.builder";

export class Executive {
  private room: Room;
  private elements: RoomElements;

  private constructor(room: Room) {
    this.room = room;
    this.elements = RoomElements.from(room);
  }

  public spawnQueue() {

    const harvesters = CreepSupport.creepsByRole(Role.HARVESTER);
    // console.log(`Count Harvesters: ${harvesters.length}`);

    const upgraders = CreepSupport.creepsByRole(Role.UPGRADER);
    // console.log(`Count Upgraders: ${upgraders.length}`);

    const builders = CreepSupport.creepsByRole(Role.BUILDER);
    // console.log(`Count Builders: ${builders.length}`);

    const guards = CreepSupport.creepsByRole(Role.GUARD);
    // console.log(`Count Guards: ${guards.length}`);

    const dropMiners = CreepSupport.creepsByRole(Role.DROP_MINER);
    // console.log(`Count Drop Miner: ${dropMiners.length}`);

    const hostileCreeps = this.room.find(FIND_HOSTILE_CREEPS);

    const dropMinerPlusHarvesterCount = dropMiners.length + harvesters.length;

    const constructionSiteCount = this.elements.constructionSites.length;

    const requiredBuilders = Math.min(Math.floor(constructionSiteCount / 2) + 1, 3);
    if (hostileCreeps.length > guards.length) {
      // Just make sure that there are equal number of guards as attackers.
      this.spawnCreepOfType(Role.GUARD);
    } else if (dropMinerPlusHarvesterCount == 0) {
      this.spawnCreepOfType(Role.HARVESTER);
    } else if (dropMiners.length < this.elements.sources.length) {
      // First priority, spawn dropminers, unless there aren't enough harvesters.
      if (dropMiners.length > harvesters.length) {
        // If we have fewer harvesters than drop miners. Spawn a harvester.
        this.spawnCreepOfType(Role.HARVESTER);
      } else {
        // We have enough harvesters, spawn a drop miner.
        this.spawnCreepOfType(Role.DROP_MINER);
      }
    } else if (harvesters.length < 3) {
      // Second priority, spawn haulers,
      this.spawnCreepOfType(Role.HARVESTER)
    } else if (upgraders.length < 5) {
      // Third priority, spawn upgrader.
      this.spawnCreepOfType(Role.UPGRADER)
    } else if (builders.length < requiredBuilders) {
      // Fourth priority, spawn builders.
      this.spawnCreepOfType(Role.BUILDER)
    } else if (hostileCreeps.length > (guards.length - 1)) {
      // Fifth priority, spawn guard.
      this.spawnCreepOfType(Role.GUARD);
    } else {
      // console.log("Not spawning anything")
      // Sixth priority, spawn a claimer.
    }
  }

  private spawnCreepOfType(role: Role): void {
    for (const spawn of this.elements.spawns) {
      if (spawn.spawning) {
        // Don't spawn another creep while one is being spawned.
        // console.log("Spawning currently, not  able to spawn anything.");
        continue;
      }
      const capitalizedRole = Executive.capitalizeFirstLetter(role);
      const newName = capitalizedRole + String(Game.time);
      console.log('Spawning new ' + role + ': ' + newName);
      const spawnCode = spawn.spawnCreep(this.bodyFor(role), newName,
        {memory: {role: role}});
      if (spawnCode != OK) {
        console.log(`Can not spawn due to code: ${spawnCode}`)
      }
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
    // TODO: Optimize this so that creeps by role is cached.
    return CreepBuilder.create(role, this.room, CreepSupport.creepsByRole(role).length);
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

