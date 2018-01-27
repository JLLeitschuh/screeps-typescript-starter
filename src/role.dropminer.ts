export class RoleDropminer {

  public static determineSourceId(creep: Creep) : string | null {
    // Determine what source to mine at.
    const creeps = extractValues(Game.creeps);
    const assignedSourceIds : string[] = _(creeps)
      .map(creep => creep.memory.assignedSourceId)
      .filter(sourceId => sourceId != null)
      .filter(sourceId => sourceId != undefined)
      .value();
    console.log(`Already assigned IDs: ${assignedSourceIds}`);
    // TODO: Make this work in any room
    const availableSources = findSourceNotWithId(assignedSourceIds);
    if (availableSources.length == 0) {
      return null;
    } else {
      const pickedId = availableSources[0].id;
      if (_.contains(assignedSourceIds, pickedId)) {
        console.log(`Picked ID when it was already claimed! ${pickedId}`);
        return null;
      }
      return pickedId;
    }
  }

  public static run(creep: Creep) {
    if (creep.memory.assignedSourceId == undefined) {
      const sourceIdToAssign = RoleDropminer.determineSourceId(creep);
      if (sourceIdToAssign) {
        creep.memory.assignedSourceId = sourceIdToAssign;
      } else {
        console.log("No valid source to mine for creep: " + creep.name)
        return;
      }
    }
    // Go to the assigned source and mine there.
    const assignedSourceId : string = creep.memory.assignedSourceId;

    const harvestingSource: Source = findSourceAtRoomPosition(assignedSourceId);
    // console.log(`${creep.name} is harvesting Source: ${harvestingSource.pos}, Assigned Source: ${assignedSourceId}`);
    if (creep.harvest(harvestingSource) == ERR_NOT_IN_RANGE) {
      creep.moveTo(harvestingSource, {visualizePathStyle: {stroke: '#ffaa00'}})
    }
  }
}

function findSourceAtRoomPosition(sourceId: string): Source {
  return Game.getObjectById(sourceId) as Source;
}

function findSourceNotWithId(sourceIds: string[]): Source[] {
  return _.flatten(
    extractValues(Game.rooms)
      .map(room => room
        .find(FIND_SOURCES, source => !_.contains(sourceIds, source.id))));
}

function extractValues<T>(map: { [key: string]: T }): T[] {
  let list: T[] = [];
  for (let key in map) {
    list = list.concat(map[key])
  }
  return list;
}
