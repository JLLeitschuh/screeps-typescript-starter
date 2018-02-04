import {Role} from "./role";

interface PartList {
  [role: string]: BodyPartConstant[]
}

interface WeightList {
  [part: string]: number
}

export class CreepBuilder {

  private static typeStarters(role: Role): BodyPartConstant[] {
    switch (role) {
      case Role.HARVESTER:
        return [CARRY, MOVE];
      case Role.UPGRADER:
        return [WORK, CARRY, MOVE, MOVE];
      case Role.BUILDER:
        return [WORK, CARRY, MOVE, MOVE];
      case Role.DROP_MINER:
        return [WORK, WORK, CARRY, MOVE];
      case Role.GUARD:
        return [RANGED_ATTACK, MOVE];
      case Role.CLAIMER:
        return [CLAIM, MOVE];
    }
  }

  private static typeStarts = <PartList>{
    // 'hold': [CLAIM, CLAIM, MOVE, MOVE],
    // 'mover': [CARRY, MOVE],
    // 'bunkerMover': [MOVE, CARRY],
    // 'ranger': [RANGED_ATTACK, TOUGH, MOVE, MOVE],
    // 'scout': [MOVE],
    // 'remoteHarvester': [WORK, WORK, CARRY, MOVE, MOVE, MOVE]
  };

  private static typeExtenders(role: Role): BodyPartConstant[] {
    switch (role) {
      case Role.HARVESTER:
        return [CARRY, MOVE];
      case Role.UPGRADER:
        return [WORK, CARRY, MOVE];
      case Role.BUILDER:
        return [WORK, CARRY, MOVE, MOVE];
      case Role.DROP_MINER:
        return [WORK, MOVE];
      case Role.GUARD:
        return [RANGED_ATTACK, MOVE];
      case Role.CLAIMER:
        return [MOVE];
    }
  }

  private static typeExtends = <PartList>{
    // 'hold': [],
    // 'mover': [CARRY, MOVE],
    // 'bunkerMover': [CARRY],
    // 'ranger': [RANGED_ATTACK, TOUGH, MOVE, MOVE, HEAL],
    // 'scout': [],
    // 'remoteHarvester': [WORK, MOVE]
  };

  /**
   * Returns the maximum length for the body of a particular role.
   */
  private static typeLengths(role: Role): number {
    switch (role) {
      case Role.HARVESTER:
        return 20;
      case Role.UPGRADER:
        return 24;
      case Role.BUILDER:
        return 16;
      case Role.DROP_MINER:
        return 12;
      case Role.GUARD:
        return 20;
      case Role.CLAIMER:
        return 5;
    }
  }

  private static typeLength = <{ [name: string]: number }>{
    'hold': 4,
    'bunkerMover': 17,
    'ranger': 35,
    'transporter': 28,
    'scout': 1,
    'remoteHarvester': 14
  };

  public static design(role: Role, spendCap: number): BodyPartConstant[] {
    let body = CreepBuilder.typeStarters(role);
    let add = true;
    let extendIndex = 0;

    while (add) {
      const creepCost = CreepBuilder.bodyCost(body)

      const typeExtends = CreepBuilder.typeExtenders(role);
      const nextPart = typeExtends[extendIndex]

      if (
        creepCost + BODYPART_COST[nextPart] > spendCap
        ||
        body.length === CreepBuilder.typeLengths(role)
      ) {
        add = false
      } else {
        body.push(nextPart);
        extendIndex += 1;
        if (extendIndex === typeExtends.length) {
          extendIndex = 0
        }
      }
    }

    return _.sortBy(body, part => CreepBuilder.partWeight[part]);
  }

  /**
   * Designs and creates a creep body given the constraints of the room.
   *
   * @param {Role} role The role of the creep to create.
   * @param {Room} room The room to spawn the creep in.
   * @param {number} roleCreepCount The current number of creeps of the current role.
   * @returns {BodyPartConstant[]} The body to be built given the current constraints.
   */
  public static create(role: Role, room: Room, roleCreepCount: number) : BodyPartConstant[] {
    const emergency = (role === Role.HARVESTER || role === Role.DROP_MINER) && roleCreepCount === 0;
    let spendCap: number;
    if (emergency) {
      spendCap = room.energyAvailable;
    } else {
      spendCap = room.energyCapacityAvailable;
    }
    return CreepBuilder.design(role, spendCap);
  }

  private static bodyCost(body: BodyPartConstant[]): number {
    return _.sum(body, part => BODYPART_COST[part]);
  }

  private static partWeight = <WeightList>{
    'attack': 15,
    'carry': 8,
    'claim': 9,
    'heal': 20,
    'move': 5,
    'ranged_attack': 14,
    'tough': 1,
    'work': 10
  }
}
