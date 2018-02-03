import {ErrorMapper} from "utils/ErrorMapper";
import {RoleHarvester} from "./role.harvester";
import {RoleUpgrader} from "./role.upgrader";
import {RoleBuilder} from "./role.builder";
import {RoleDropminer} from "./role.dropminer";
import {Executive} from "./executive";
import {Role} from "./role";
import {RoomElements} from "./room.elements";

declare global {
  interface CreepMemory {
    [key: string]: any
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  const source = Game.spawns['Spawn1'];
  const baseRoom = source.room;

  const towers = baseRoom.find(FIND_MY_STRUCTURES, {filter: s => s.structureType == STRUCTURE_TOWER}) as StructureTower[];
  towers.forEach(tower => {
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
    } else {
      const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) =>
          structure.hits < structure.hitsMax && (structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_WALL)
      });
      if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
      }
    }
  });

  const executive = Executive.from(baseRoom);

  executive.spawnQueue();

  if (Game.spawns['Spawn1'].spawning) {
    // Report what is being spawned.
    const spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
      '🛠️' + spawningCreep.memory["role"],
      Game.spawns['Spawn1'].pos.x + 1,
      Game.spawns['Spawn1'].pos.y,
      {align: 'left', opacity: 0.8});
  }

  for (let creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    if (creep.memory["role"] == Role.HARVESTER) {
      RoleHarvester.run(creep);
    }
    if (creep.memory["role"] == Role.UPGRADER) {
      RoleUpgrader.run(creep);
    }
    if (creep.memory["role"] == Role.BUILDER) {
      RoleBuilder.run(creep);
    }
    if (creep.memory["role"] == Role.DROP_MINER) {
      RoleDropminer.run(creep);
    }
    if (creep.memory["role"] == Role.GUARD) {
      const hostileCreeps = baseRoom.find(FIND_HOSTILE_CREEPS);
      if (hostileCreeps.length > 0) {
        const targetsSorted = _.sortBy(hostileCreeps, target => creep.pos.getRangeTo(target));
        if (creep.attack(targetsSorted[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targetsSorted[0]);
        }
      } else {
        // Get out of the way for more mining.
        let position = baseRoom.getPositionAt(7, 19);
        if (position != null) {
          creep.moveTo(position);
        }
      }
    }

    // Clean this up.
    RoomElements.clear();
  }

  // if (Game.time % 10 == 0) {
  //   constructRoads();
  //   const extensionConstructionLocation = baseRoom.getPositionAt(34, 36);
  //   if (extensionConstructionLocation != null) {
  //     constructExtensions5x5(extensionConstructionLocation);
  //   }
  // }
});

function constructRoads() {
  const spawn = Game.spawns["Spawn1"];
  const room = spawn.room;
  const sources: RoomObject[] = room.find(FIND_SOURCES);
  const controller = room.controller;
  if (controller == null) return;
  const locations = sources.concat([controller]);
  locations.forEach(location => {
    const path = PathFinder.search(spawn.pos, {pos: location.pos, range: 1});
    path.path.forEach(position => {
      room.createConstructionSite(position, STRUCTURE_ROAD);
    });
  });
}


// function constructExtensions5x5(rootPosition: RoomPosition) {
//   const diagonals: { x: number, y: number }[] = [
//     {x: +1, y: +1},
//     {x: -1, y: -1},
//     {x: +1, y: -1},
//     {x: -1, y: +1}
//   ];
//   const positions = diagonals.map(diagonal => {
//     return new RoomPosition(
//       rootPosition.x + diagonal.x,
//       rootPosition.y + diagonal.y,
//       rootPosition.roomName);
//   }).concat(rootPosition);
//   positions.forEach(position => {
//     position.createConstructionSite(STRUCTURE_EXTENSION);
//   });
// }
