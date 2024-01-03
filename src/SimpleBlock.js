const NO_LACING = 0;
const XIPH_LACING = 1;
const FIXED_LACING = 2;
const EBML_LACING = 3;

class SimpleBlock {
  constructor() {
    this.cluster;
    this.demuxer;
    this.dataInterface; // = dataInterface;
    this.offset; // = blockHeader.offset;
    this.dataOffset; // = blockHeader.dataOffset;
    this.size; // = blockHeader.size;
    this.end; // = blockHeader.end;
    this.loaded = false;
    this.trackNumber = null;
    this.timeCode = -1;
    this.flags = null;
    this.keyFrame = false;
    this.invisible = false;
    this.lacing = NO_LACING;
    this.discardable = false;
    this.lacedFrameCount = null;
    this.headerSize = null;
    this.frameSizes = [];
    this.tempCounter = null;
    this.tempFrame = null;
    this.track = null;
    this.frameLength = null;
    this.isLaced = false;
    this.stop = null; // = this.offset + this.size;
    this.status = false;
    this.ebmlLacedSizes = [];
    this.ebmlParsedSizes = [];
    this.ebmlLacedSizesParsed = false;
  }

  init(offset, size, end, dataOffset, dataInterface, cluster) {
    this.cluster = cluster;
    this.demuxer = this.cluster.demuxer;
    this.dataInterface = dataInterface;
    this.offset = offset;
    this.dataOffset = dataOffset;
    this.size = size;
    this.end = end;
    this.loaded = false;
    this.trackNumber = null;
    this.timeCode = null;
    this.flags = null;
    this.keyFrame = false;
    this.invisible = false;
    this.lacing = NO_LACING;
    this.discardable = false;
    this.lacedFrameCount = null;
    this.headerSize = null;
    this.frameSizes = [];
    this.tempCounter = null;
    this.tempFrame = null;
    this.track = null;
    this.frameLength = null;
    this.isLaced = false;
    this.stop = this.offset + this.size;
    this.status = true;
    this.trackEntries = this.demuxer.tracks.trackEntries;
    this.videoPackets = this.demuxer.videoPackets;
    this.audioPackets = this.demuxer.audioPackets;
    this.laceFrameHelper = null;
    this.lacedFrameHeaderSize = null;
    this.ebmlLacedSizes = [];
    this.lacedFrameDataSize = null;
    this.fixedFrameLength = null;
    this.firstLacedFrameSize = null;
    this.ebmlParsedSizes = [];
    this.ebmlLacedSizesParsed = false;
  }

  reset() {
    this.status = false;
  }

  loadTrack() {
    this.track = this.trackEntries[this.trackNumber - 1];
  }

  async load(addBlockToPackets, blockTypes = ["video", "audio"]) {
    const dataInterface = this.dataInterface;
    let blockData;
    if (this.loaded) {
      return;
    }
    if (this.trackNumber === null) {
      this.trackNumber = await dataInterface.readVint();
      if (this.trackNumber === null) return;
      this.loadTrack();
    }
    if (this.timeCode === null) {
      this.timeCode = await dataInterface.readUnsignedInt(2); //Be signed for some reason?
      if (this.timeCode === null) return;
    }

    if (this.flags === null) {
      /// FIX THIS
      this.flags = await dataInterface.readUnsignedInt(1);
      if (this.flags === null) return;

      this.keyFrame = ((this.flags >> 7) & 0x01) === 0 ? false : true;
      this.invisible = ((this.flags >> 2) & 0x01) === 0 ? true : false;
      this.lacing = (this.flags & 0x06) >> 1;
      if (this.lacing > 3 || this.lacing < 0) {
        console.warn("INVALID LACING");
        return;
      }
    }

    if (!this.headerSize)
      this.headerSize = dataInterface.offset - this.dataOffset;
    let startPosition;
    let endPosition;
    let timeStamp;
    let tempFrame = null;
    let fullTimeCode = 0;
    switch (this.lacing) {
      case FIXED_LACING:
        if (!this.frameLength) {
          this.frameLength = this.size - this.headerSize;
          if (this.frameLength <= 0) {
            console.warn("INVALID FRAME LENGTH " + this.frameLength);
            return;
          }
        }
        if (!this.lacedFrameCount) {
          this.lacedFrameCount = await dataInterface.readUnsignedInt(1);
          if (this.lacedFrameCount === null) return;
          this.lacedFrameCount++;
        }

        startPosition = dataInterface.offset;
        tempFrame = await dataInterface.getBinary(this.frameLength - 1);
        endPosition = dataInterface.offset;
        if (tempFrame === null) {
          return;
        }
        this.fixedFrameLength = (this.frameLength - 1) / this.lacedFrameCount;
        fullTimeCode = this.timeCode + this.cluster.timeCode;
        timeStamp = fullTimeCode / 1000;
        if (timeStamp < 0) {
          console.warn("INVALID TIMESTAMP");
          return;
        }
        for (let i = 0; i < this.lacedFrameCount; i++) {
          if (this.track.trackType === 1 && blockTypes.includes("video")) {
            let packet = {
              start: startPosition,
              end: endPosition,
              timestamp: timeStamp,
              keyframeTimestamp: timeStamp,
              isKeyframe: this.keyFrame,
              size: tempFrame.byteLength,
            };
            if (addBlockToPackets) {
              this.videoPackets.push(packet);
            } else {
              blockData = packet;
            }
          } else if (
            this.track.trackType === 2 &&
            blockTypes.includes("audio")
          ) {
            let packet = {
              start: startPosition,
              end: endPosition,
              timestamp: timeStamp,
              size: tempFrame.byteLength,
            };
            if (addBlockToPackets) {
              this.audioPackets.push(packet);
            } else {
              blockData = packet;
            }
          }
        }
        break;
      case EBML_LACING:
        if (!this.frameLength) {
          this.frameLength = this.size - this.headerSize;
          if (this.frameLength <= 0) {
            console.warn("INVALID FRAME LENGTH " + this.frameLength);
            return;
          }
        }
        if (!this.lacedFrameCount) {
          this.lacedFrameCount = await dataInterface.readUnsignedInt(1);
          if (this.lacedFrameCount === null) return;
          this.lacedFrameCount++;
        }
        if (!this.firstLacedFrameSize) {
          const firstLacedFrameSize = await dataInterface.readVint();
          if (firstLacedFrameSize !== null) {
            this.firstLacedFrameSize = firstLacedFrameSize;
            this.ebmlLacedSizes.push(this.firstLacedFrameSize);
          } else {
            return;
          }
        }
        if (!this.tempCounter) {
          this.tempCounter = 0;
        }
        while (this.tempCounter < this.lacedFrameCount - 1) {
          const frameSize = await dataInterface.readLacingSize();
          if (frameSize === null) return;
          this.ebmlLacedSizes.push(frameSize);
          this.tempCounter++;
        }
        if (!this.ebmlLacedSizesParsed) {
          this.ebmlParsedSizes[0] = this.ebmlLacedSizes[0];
          let total = this.ebmlParsedSizes[0];
          for (let i = 1; i < this.lacedFrameCount - 1; i++) {
            this.ebmlParsedSizes[i] =
              this.ebmlLacedSizes[i] + this.ebmlParsedSizes[i - 1];
            total += this.ebmlParsedSizes[i];
          }
          if (!this.lacedFrameDataSize)
            this.lacedFrameDataSize = this.end - dataInterface.offset;

          const lastSize = this.lacedFrameDataSize - total;
          this.ebmlParsedSizes.push(lastSize);
          this.ebmlLacedSizesParsed = true;
          this.ebmlTotalSize = total + lastSize;
        }
        startPosition = dataInterface.offset;
        tempFrame = await dataInterface.getBinary(this.lacedFrameDataSize);
        endPosition = dataInterface.offset;
        if (tempFrame === null) {
          return;
        }
        fullTimeCode = this.timeCode + this.cluster.timeCode;
        timeStamp = fullTimeCode / 1000;
        if (timeStamp < 0) {
          console.warn("INVALID TIMESTAMP");
          return;
        }
        let start = 0;
        let end = this.ebmlParsedSizes[0];
        for (let i = 0; i < this.lacedFrameCount; i++) {
          if (this.track.trackType === 1 && blockTypes.includes("video")) {
            let packet = {
              start: startPosition,
              end: endPosition,
              timestamp: timeStamp,
              keyframeTimestamp: timeStamp,
              isKeyframe: this.keyFrame,
              size: tempFrame.byteLength,
            };
            if (addBlockToPackets) {
              this.videoPackets.push(packet);
            } else {
              blockData = packet;
            }
          } else if (
            this.track.trackType === 2 &&
            blockTypes.includes("audio")
          ) {
            let packet = {
              start: startPosition,
              end: endPosition,
              timestamp: timeStamp,
              size: tempFrame.byteLength,
            };
            if (addBlockToPackets) {
              this.audioPackets.push(packet);
            } else {
              blockData = packet;
            }
          }
          start += this.ebmlParsedSizes[i];
          end += this.ebmlParsedSizes[i];
          if (i === this.lacedFrameCount - 1) {
            end = null;
          }
        }
        this.tempCounter = null;
        tempFrame = null;
        break;
      case XIPH_LACING:
      case NO_LACING:
        if (this.lacing === EBML_LACING) {
          console.warn("EBML_LACING");
        }
        if (this.lacing === XIPH_LACING) {
          console.warn("XIPH_LACING");
        }
        if (!this.frameLength) {
          this.frameLength = this.size - this.headerSize;
          if (this.frameLength <= 0) {
            console.warn("INVALID FRAME LENGTH " + this.frameLength);
            return;
          }
        }
        startPosition = dataInterface.offset;
        tempFrame = await dataInterface.getBinary(this.frameLength);
        endPosition = dataInterface.offset;
        if (tempFrame === null) {
          return;
        } else {
          if (dataInterface.usingBufferedRead === true) {
            console.warn("SHOULD NOT BE BUFFERED READ");
            return;
          }
          if (tempFrame.byteLength !== this.frameLength) {
            console.warn("INVALID FRAME");
            return;
          }
        }
        fullTimeCode = this.timeCode + this.cluster.timeCode;
        timeStamp = fullTimeCode / 1000;
        if (timeStamp < 0) {
          console.warn("INVALID TIMESTAMP");
          return;
        }
        if (this.track.trackType === 1 && blockTypes.includes("video")) {
          let packet = {
            start: startPosition,
            end: endPosition,
            timestamp: timeStamp,
            keyframeTimestamp: timeStamp,
            isKeyframe: this.keyFrame,
            size: tempFrame.byteLength,
          };
          if (addBlockToPackets) {
            this.videoPackets.push(packet);
          } else {
            blockData = packet;
          }
        } else if (this.track.trackType === 2 && blockTypes.includes("audio")) {
          let packet = {
            start: startPosition,
            end: endPosition,
            timestamp: timeStamp,
            size: tempFrame.byteLength,
          };
          if (addBlockToPackets) {
            this.audioPackets.push(packet);
          } else {
            blockData = packet;
          }
        }
        tempFrame = null;
        break;
      default:
        return;
    }

    this.loaded = true;
    this.headerSize = null;
    this.tempFrame = null;
    this.tempCounter = null;
    this.frameLength = null;
    return blockData;
  }
}

module.exports = SimpleBlock;
