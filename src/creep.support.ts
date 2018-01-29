import {Role} from "./role";
import {RoomElements} from "./room.elements";

export class CreepSupport {
  public static collectEnergy(creep: Creep) {
    // TODO: Filter out energy
    const energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {range: 1});

    if (energy) {
      // console.log('found ' + energy.amount + ' energy at ', energy.pos);
      if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
        creep.moveTo(energy, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    } else {
      const elements = RoomElements.from(creep.room);
      // const energyContainsers
    }
  }

  public static creepsByRole(role: Role): Creep[] {
    return _.filter(Game.creeps, (creep) => creep.memory["role"] == role);
  }

  /**
   * @param {Creep} creep The creep to transition states for.
   * @returns {boolean} If the creep is working or not.
   */
  public static workTransition(creep: Creep) : boolean {
    if (creep.memory.working && creep.carry.energy == 0) {
      creep.memory.working = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
      creep.memory.working = true;
      creep.say(CreepSupport.sayWorking(creep.memory.role));
    }
    return creep.memory.working;
  }

  /**
   * Gets the string to describe what the role's working action is.
   */
  public static sayWorking(role: Role): string {
    switch (role) {
      case Role.DROP_MINER:
        return '⛏ mine';
      case Role.BUILDER:
        return '🚧 build';
      case Role.UPGRADER:
        return '⚡⏫⚡ upgrade';
      case Role.HARVESTER:
        return '🔨 supply';
      default :
        return 'working';
    }
  }
}
