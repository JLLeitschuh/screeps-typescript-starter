import {Role} from "./role";
import {RoomElements} from "./room.elements";

export class CreepSupport {
  public static collectEnergy(creep: Creep) {
    // First try to find dropped energy.
    let allEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: resource => resource.resourceType == RESOURCE_ENERGY
    }) as Resource<RESOURCE_ENERGY>[];
    let energyPiles =
      _.sortBy(_.filter(allEnergy, energy => energy.amount >= (creep.carryCapacity - creep.carry.energy)),
        energy => creep.pos.getRangeTo(energy));
    if (energyPiles.length!) {
      // Backup search if there isn't any dropped energy that will fill the capacity of the creep.
      energyPiles = _.sortBy(allEnergy, 'ammount');
    }

    if (energyPiles.length) {
      if (creep.pickup(energyPiles[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(energyPiles[0], {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    } else {
      // Figure out if all the drop miners are missing.
      const dropMiners = CreepSupport.creepsByRole(Role.DROP_MINER);
      const elements = RoomElements.from(creep.room);
      if (dropMiners.length) {
        // Then try to grab from the energy containers.
        const containers = _(elements.energyDepositContainers)
          .chain()
          .filter(container => container.store.energy > 0)
          .sortBy(container => creep.pos.getRangeTo(container.pos))
          .value();
        if (containers.length) {
          const container = containers[0];
          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
          }
        }
      } else {
        // There are no Drop Miners so we need to do do our own work.
        const sourcesSorted = _.sortBy(elements.sources, source => creep.pos.getRangeTo(source));
        const closestSource = sourcesSorted[0];
        if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
          creep.moveTo(closestSource, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      }
    }
  }

  public static creepsByRole(role: Role): Creep[] {
    return _.filter(Game.creeps, (creep) => creep.memory["role"] == role);
  }

  /**
   * @param {Creep} creep The creep to transition states for.
   * @returns {boolean} If the creep is working or not.
   */
  public static workTransition(creep: Creep): boolean {
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
