import {ErrorMapper} from "utils/ErrorMapper";
import {RoleHarvester} from "./role.harvester";
import {RoleUpgrader} from "./role.upgrader";
import {RoleBuilder} from "./role.builder";

declare global {
  interface CreepMemory {
    [key: string]: any
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  const baseRoom = Game.spawns['Spawn1'].room;
  console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  const harvesters = creepsByRole(Role.HARVESTER);
  console.log('Harvesters: ' + harvesters.length);
  if (harvesters.length < 3) {
    spawnCreepOfType(Role.HARVESTER)
  }

  const upgraders = creepsByRole(Role.UPGRADER);
  console.log('Upgraders: ' + upgraders.length);
  if (upgraders.length < 2) {
    spawnCreepOfType(Role.UPGRADER)
  }

  const builders = creepsByRole(Role.BUILDER);
  console.log('Builders: ' + upgraders.length);
  if (builders.length < 4) {
    spawnCreepOfType(Role.BUILDER)
  }

  if (Game.spawns['Spawn1'].spawning) {
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
  }

  constructRoads();
  const extensionConstructionLocation = baseRoom.getPositionAt(34, 36);
  if (extensionConstructionLocation != null) {
    constructExtensions5x5(extensionConstructionLocation);
  }

});

enum Role {
  HARVESTER = "harvester",
  UPGRADER = "upgrader",
  BUILDER = "builder"
}

function creepsByRole(role: Role): Creep[] {
  return _.filter(Game.creeps, (creep) => creep.memory["role"] == role);
}

function spawnCreepOfType(role: Role): void {
  if (Game.spawns['Spawn1'].spawning) {
    // Don't spawn another creep while one is being spawned.
    return
  }
  const capitalizedRole = capitalizeFirstLetter(role);
  const newName = capitalizedRole + String(Game.time);
  console.log('Spawning new ' + role + ': ' + newName);
  Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
    {memory: {role: role}});
}

function capitalizeFirstLetter(string: String): String {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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


function constructExtensions5x5(rootPosition: RoomPosition) {
  const diagonals: { x: number, y: number }[] = [
    {x: +1, y: +1},
    {x: -1, y: -1},
    {x: +1, y: -1},
    {x: -1, y: +1}
  ];
  const positions = diagonals.map(diagonal => {
    return new RoomPosition(
      rootPosition.x + diagonal.x,
      rootPosition.y + diagonal.y,
      rootPosition.roomName);
  }).concat(rootPosition);
  positions.forEach(position => {
    position.createConstructionSite(STRUCTURE_EXTENSION);
  });
}
