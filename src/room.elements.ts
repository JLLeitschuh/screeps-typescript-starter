const adjacent: { x: number, y: number }[] = [
  {x: +1, y: +1},
  {x: +1, y: +0},
  {x: +1, y: -1},
  {x: +0, y: +1},
  {x: +0, y: -1},
  {x: -1, y: +1},
  {x: -1, y: +0},
  {x: -1, y: -1}
];

export class RoomElements {
  spawns: StructureSpawn[];
  towers: StructureTower[];
  sources: Source[];
  constructionSites: ConstructionSite[];
  containers: StructureContainer[];
  /**
   * The containers that Drop Miners are depositing into.
   */
  energyDepositContainers: StructureContainer[];

  constructor(room: Room) {
    this.spawns = RoomElements.findStructure(room, STRUCTURE_SPAWN) as StructureSpawn[];
    this.towers = RoomElements.findStructure(room, STRUCTURE_TOWER) as StructureTower[];
    this.sources = room.find(FIND_SOURCES);
    this.constructionSites = room.find(FIND_CONSTRUCTION_SITES);
    this.containers = RoomElements.findStructure(room, STRUCTURE_CONTAINER) as StructureContainer[];

    // The room positions that are adjacent to all of the sources.
    const adjacentRoomPositionsToSources =
      _.flatten(_.map(this.sources, source => RoomElements.adjacentRoomPositions(source.pos)));

    this.energyDepositContainers =
      _.filter(
        this.containers,
        container => _.any(
          adjacentRoomPositionsToSources,
          roomPosition => roomPosition.isEqualTo(container.pos)));
  }

  /**
   * Get the energy container for the given source.
   */
  public containerFor(source: Source) : StructureContainer | null {
    const containers = _.filter(this.energyDepositContainers, container => {
      return RoomElements.isAjdacent(container.pos, source.pos);
    });
    if (containers.length) {
      if (containers.length > 1) {
        console.log(`WARNING: Multiple adjacent containers for source ${source}`);
      }
      return containers[0];
    }
    // We haven't found one. Which is fine.
    return null;
  }

  private static isAjdacent(first: RoomPosition, second: RoomPosition) : boolean {
    if (first.roomName != second.roomName) {
      return false;
    }
    const dx = Math.abs(first.x - second.x),
      dy = Math.abs(first.y - second.y);
    return (dx + dy === 1);
  }

  /**
   * Calculates the room positions that are adjacent to a given room position.
   * @param {RoomPosition} roomPosition The room position to compute accents to.
   * @returns {RoomPosition[]} A list of room positions that are adjacent to this room position.
   */
  public static adjacentRoomPositions(roomPosition: RoomPosition): RoomPosition[] {
    return adjacent.map(adjacent => {
      return new RoomPosition(
        roomPosition.x + adjacent.x,
        roomPosition.y + adjacent.y,
        roomPosition.roomName);
    });
  }

  private static findStructure(room: Room, structureType: StructureConstant): Structure[] {
    return room.find(FIND_STRUCTURES, {filter: s => s.structureType == structureType});
  }

  /**
   * Static list of these elements to prevent repeated computations.
   */
  private static elements: { [key: string]: RoomElements } = {};

  public static from(room: Room) {
    // TODO: Fix my code so I don't do this any longer.
    if (RoomElements.elements[room.name]) {
      return RoomElements.elements[room.name];
    } else {
      const element = new RoomElements(room);
      RoomElements.elements[room.name] = element;
      return element;
    }
  }

  public static clear() {
    this.elements = {};
  }
}
