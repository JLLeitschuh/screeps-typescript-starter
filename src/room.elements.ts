
export class RoomElements {
  spawns: StructureSpawn[];
  towers: StructureTower[];
  sources: Source[];

  constructor(room: Room) {
    this.spawns = RoomElements.findStructure(room, STRUCTURE_SPAWN) as StructureSpawn[];
    this.towers = RoomElements.findStructure(room, STRUCTURE_TOWER) as StructureTower[];
    this.sources = room.find(FIND_SOURCES);
  }

  public static from(room: Room) {
    return new RoomElements(room);
  }

  private static findStructure(room: Room, structureType : StructureConstant) : AnyOwnedStructure[] {
    return room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType == structureType});
  }
}
