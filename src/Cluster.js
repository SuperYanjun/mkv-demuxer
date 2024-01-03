const ElementHeader = require("./ElementHeader");
const SimpleBlock = require("./SimpleBlock");
const BlockGroup = require("./BlockGroup");

class Cluster {
  constructor(offset, size, end, dataOffset, dataInterface, demuxer) {
    this.demuxer = demuxer;
    this.dataInterface = dataInterface;
    this.offset = offset;
    this.size = size;
    this.end = end;
    this.dataOffset = dataOffset;
    this.loaded = false;
    this.currentElement = null;
    this.timeCode = null;
    this.tempBlock = null;
    this.position = null;
    this.tempElementHeader = new ElementHeader(-1, -1, -1, -1);
    this.tempElementHeader.reset();
    this.tempBlock = new SimpleBlock();
    this.blockGroups = [];
  }

  async load() {
    while (this.dataInterface.offset < this.end) {
      if (!this.tempElementHeader.status) {
        await this.dataInterface.peekAndSetElement(this.tempElementHeader);
        if (!this.tempElementHeader.status) return;
      }
      switch (this.tempElementHeader.id) {
        case 0xe7: // TimeCode
          const timeCode = await this.dataInterface.readUnsignedInt(
            this.tempElementHeader.size
          );
          if (timeCode !== null) {
            this.timeCode = timeCode;
          } else {
            return;
          }
          break;
        case 0xa3: // Simple Block
          if (!this.tempBlock.status)
            this.tempBlock.init(
              this.tempElementHeader.offset,
              this.tempElementHeader.size,
              this.tempElementHeader.end,
              this.tempElementHeader.dataOffset,
              this.dataInterface,
              this
            );
          await this.tempBlock.load(true);
          if (!this.tempBlock.loaded) return;
          this.tempBlock.reset();
          break;
        case 0xa7: // Position
          const position = await this.dataInterface.readUnsignedInt(
            this.tempElementHeader.size
          );
          if (position !== null) {
            this.position = position;
          } else {
            return;
          }
          break;
        case 0xa0: // Block Group
          if (!this.currentBlockGroup)
            this.currentBlockGroup = new BlockGroup(
              this.tempElementHeader.getData(),
              this.dataInterface
            );
          await this.currentBlockGroup.load();
          if (!this.currentBlockGroup.loaded) return;
          this.blockGroups.push(this.currentBlockGroup);
          this.currentBlockGroup = null;
          break;
        case 0xab: // PrevSize
          const prevSize = await this.dataInterface.readUnsignedInt(
            this.tempElementHeader.size
          );
          if (prevSize !== null) this.prevSize = prevSize;
          else return;
          break;
        case 0xbf: // CRC-32
          const crc = await this.dataInterface.getBinary(
            this.tempElementHeader.size
          );
          if (crc !== null) crc;
          else return;
          break;
        default:
          const skipped = await this.dataInterface.skipBytes(
            this.tempElementHeader.size
          );
          if (skipped === false) {
            return;
          }
          break;
      }
      this.tempElementHeader.reset();
    }
    this.loaded = true;
  }

  async loadTimeCode() {
    while (this.dataInterface.offset < this.end && this.timeCode == null) {
      if (!this.tempElementHeader.status) {
        await this.dataInterface.peekAndSetElement(this.tempElementHeader);
        if (!this.tempElementHeader.status) return;
      }
      switch (this.tempElementHeader.id) {
        case 0xe7: // TimeCode
          const timeCode = await this.dataInterface.readUnsignedInt(
            this.tempElementHeader.size
          );
          if (timeCode !== null) {
            this.timeCode = timeCode;
          } else {
            return;
          }
          break;
        default:
          const skipped = await this.dataInterface.skipBytes(
            this.tempElementHeader.size
          );
          if (skipped === false) {
            return;
          }
          break;
      }
      this.tempElementHeader.reset();
    }
    return;
  }

  async loadBlock() {
    let frame;
    if (!this.tempElementHeader.status) {
      await this.dataInterface.peekAndSetElement(this.tempElementHeader);
      if (!this.tempElementHeader.status) return null;
    }
    switch (this.tempElementHeader.id) {
      case 0xa3: // Simple Block
        if (!this.tempBlock.status)
          this.tempBlock.init(
            this.tempElementHeader.offset,
            this.tempElementHeader.size,
            this.tempElementHeader.end,
            this.tempElementHeader.dataOffset,
            this.dataInterface,
            this
          );
        frame = await this.tempBlock.load(false, ["video"]);
        if (!this.tempBlock.loaded) return null;
        this.tempBlock.reset();
        break;
      case 0xa0: // Block Group
        console.log("frame: blockgroup");
        if (!this.currentBlockGroup)
          this.currentBlockGroup = new BlockGroup(
            this.tempElementHeader.getData(),
            this.dataInterface
          );
        await this.currentBlockGroup.load();
        if (!this.currentBlockGroup.loaded) return null;
        // ******
        this.currentBlockGroup = null;
        break;
      default:
        const skipped = await this.dataInterface.skipBytes(
          this.tempElementHeader.size
        );
        if (skipped === false) {
          return null;
        }
        break;
    }
    this.tempElementHeader.reset();
    return frame;
  }
  async loadBlocks() {
    const blocks = [];
    while (this.dataInterface.offset < this.end) {
      if (!this.tempElementHeader.status) {
        await this.dataInterface.peekAndSetElement(this.tempElementHeader);
        if (!this.tempElementHeader.status) return;
      }
      switch (this.tempElementHeader.id) {
        case 0xa3: // Simple Block
          if (!this.tempBlock.status)
            this.tempBlock.init(
              this.tempElementHeader.offset,
              this.tempElementHeader.size,
              this.tempElementHeader.end,
              this.tempElementHeader.dataOffset,
              this.dataInterface,
              this
            );
          const frame = await this.tempBlock.load(false, ["video"]);
          if (!this.tempBlock.loaded) return null;
          if (frame) blocks.push(frame);
          this.tempBlock.reset();
          break;
        default:
          const skipped = await this.dataInterface.skipBytes(
            this.tempElementHeader.size
          );
          if (skipped === false) {
            return null;
          }
          break;
      }
      this.tempElementHeader.reset();
    }
    return blocks;
  }
}

module.exports = Cluster;
