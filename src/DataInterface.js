const INITIAL_COUNTER = -1;
const ElementHeader = require("./ElementHeader");

class DataInterface {
  constructor(demuxer) {
    this.demuxer = demuxer;
    this.overallPointer = 0;
    this.internalPointer = 0;
    this.currentBuffer = null;
    this.dataBufferOffsets = [];
    this.tempFloat64 = new DataView(new ArrayBuffer(8));
    this.tempFloat32 = new DataView(new ArrayBuffer(4));
    this.tempBinaryBuffer = null;

    this.tempElementOffset = null;
    this.tempElementDataOffset = null;
    this.tempSize = null;
    this.tempOctetWidth = null;
    this.tempOctet = null;
    this.tempByteBuffer = 0;
    this.tempByteCounter = 0;
    this.tempElementId = null;
    this.tempElementSize = null;
    this.tempVintWidth = null;
    this.tempResult = null;
    this.tempCounter = INITIAL_COUNTER;
    this.usingBufferedRead = false;

    Object.defineProperty(this, "offset", {
      get: function () {
        return this.overallPointer;
      },

      set: function (offset) {
        this.overallPointer = offset;
      },
    });
    /**
     * Returns the bytes left in the current buffer
     */
    Object.defineProperty(this, "remainingBytes", {
      get: function () {
        if (!this.currentBuffer) return 0;
        else return this.currentBuffer.byteLength - this.internalPointer;
      },
    });
  }

  flush() {
    this.overallPointer = 0;
    this.internalPointer = 0;
    this.currentBuffer = null;
    this.dataBufferOffsets = [];
    this.tempFloat64 = new DataView(new ArrayBuffer(8));
    this.tempFloat32 = new DataView(new ArrayBuffer(4));
    this.tempBinaryBuffer = null;

    this.tempElementOffset = null;
    this.tempElementDataOffset = null;
    this.tempSize = null;
    this.tempOctetWidth = null;
    this.tempOctet = null;
    this.tempByteBuffer = 0;
    this.tempByteCounter = 0;
    this.tempElementId = null;
    this.tempElementSize = null;
    this.tempVintWidth = null;
    this.tempResult = null;
    this.tempCounter = INITIAL_COUNTER;
    this.usingBufferedRead = false;
  }

  async recieveInput() {
    this.filePieceSize = this.demuxer.filePieceSize;
    let filePiece;
    if (this.demuxer.currentFileOffset < this.demuxer.fileSize) {
      const nextOffset =
        this.filePieceSize + this.demuxer.currentFileOffset >=
        this.demuxer.fileSize
          ? this.demuxer.fileSize
          : this.filePieceSize + this.demuxer.currentFileOffset;
      if (this.currentBuffer === null) {
        const currentRange = [this.demuxer.currentFileOffset, nextOffset];
        filePiece = await this.demuxer.file
          .slice(currentRange[0], currentRange[1])
          .arrayBuffer();
        this.currentBuffer = new DataView(filePiece);
        this.internalPointer = 0;
      } else {
        this.dataBufferOffsets.push([
          this.demuxer.currentFileOffset,
          nextOffset,
        ]);
      }
      this.demuxer.currentFileOffset = nextOffset;
    }
  }

  async popBuffer() {
    if (this.remainingBytes === 0) {
      if (this.dataBufferOffsets.length > 0) {
        const currentRange = this.dataBufferOffsets.shift();
        const filePiece = await this.demuxer.file
          .slice(currentRange[0], currentRange[1])
          .arrayBuffer();
        this.currentBuffer = new DataView(filePiece);
      } else if (this.offset < this.demuxer.fileSize) {
        await this.recieveInput();
        await this.popBuffer();
      } else {
        this.currentBuffer = null;
      }
      this.internalPointer = 0;
    }
  }

  async jumpToPosition(position) {
    this.demuxer.currentFileOffset = 0;
    this.flush();
    this.demuxer.currentFileOffset = position;
    this.overallPointer = position;
    await this.recieveInput();
    await this.popBuffer();
  }

  async readDate(size) {
    return await this.readSignedInt(size);
  }

  async readId() {
    if (!this.currentBuffer) return null;
    if (!this.tempOctet) {
      this.tempElementOffset = this.overallPointer; // Save the element offset
      this.tempOctet = this.currentBuffer.getUint8(this.internalPointer);
      await this.incrementPointers(1);
      this.tempOctetWidth = this.calculateOctetWidth();
    }
    let tempByte;
    if (!this.tempByteCounter) this.tempByteCounter = 0;
    while (this.tempByteCounter < this.tempOctetWidth) {
      if (!this.currentBuffer) return null;
      if (this.tempByteCounter === 0) {
        this.tempByteBuffer = this.tempOctet;
      } else {
        tempByte = await this.readByte();
        this.tempByteBuffer = (this.tempByteBuffer << 8) | tempByte;
      }
      this.tempByteCounter++;
      await this.popBuffer();
    }
    let result = this.tempByteBuffer;
    this.tempOctet = null;
    this.tempByteCounter = null;
    this.tempByteBuffer = null;
    this.tempOctetWidth = null;
    return result;
  }

  async readLacingSize() {
    let vint = await this.readVint();
    if (vint === null) {
      return null;
    } else {
      switch (this.lastOctetWidth) {
        case 1:
          vint -= 63;
          break;
        case 2:
          vint -= 8191;
          break;
        case 3:
          vint -= 1048575;
          break;
        case 4:
          vint -= 134217727;
          break;
      }
    }
    return vint;
  }

  async readVint() {
    if (!this.currentBuffer) return null;
    if (!this.tempOctet) {
      this.tempOctet = this.currentBuffer.getUint8(this.internalPointer);
      await this.incrementPointers(1);
      this.tempOctetWidth = this.calculateOctetWidth();
    }
    if (!this.tempByteCounter) this.tempByteCounter = 0;
    let tempByte;
    let tempOctetWidth = this.tempOctetWidth;
    while (this.tempByteCounter < tempOctetWidth) {
      if (!this.currentBuffer) return null;
      if (this.tempByteCounter === 0) {
        let mask = ((0xff << tempOctetWidth) & 0xff) >> tempOctetWidth;
        this.tempByteBuffer = this.tempOctet & mask;
      } else {
        tempByte = await this.readByte();
        this.tempByteBuffer = (this.tempByteBuffer << 8) | tempByte;
      }
      this.tempByteCounter++;
      await this.popBuffer();
    }
    let result = this.tempByteBuffer;
    this.tempOctet = null;
    this.lastOctetWidth = this.tempOctetWidth;
    this.tempOctetWidth = null;
    this.tempByteCounter = null;
    this.tempByteBuffer = null;
    return result;
  }

  async readByte() {
    if (!this.currentBuffer) {
      return null;
    }
    const byteToRead = this.currentBuffer.getUint8(this.internalPointer);
    await this.incrementPointers(1);
    return byteToRead;
  }

  async readSignedByte() {
    if (!this.currentBuffer) {
      return null;
    }
    const byteToRead = this.currentBuffer.getInt8(this.internalPointer);
    await this.incrementPointers(1);
    return byteToRead;
  }

  async peekElement() {
    if (!this.currentBuffer) {
      return null;
    }
    if (!this.tempElementId) {
      this.tempElementId = await this.readId();
      if (this.tempElementId === null) return null;
    }
    if (!this.tempElementSize) {
      this.tempElementSize = await this.readVint();
      if (this.tempElementSize === null) return null;
    }
    const element = new ElementHeader(
      this.tempElementId,
      this.tempElementSize,
      this.tempElementOffset,
      this.overallPointer
    );
    this.tempElementId = null;
    this.tempElementSize = null;
    this.tempElementOffset = null;
    return element;
  }

  async peekAndSetElement(element) {
    if (!this.currentBuffer) {
      return;
    }
    if (!this.tempElementId) {
      this.tempElementId = await this.readId();
      if (this.tempElementId === null) return;
    }
    if (!this.tempElementSize) {
      this.tempElementSize = await this.readVint();
      if (this.tempElementSize === null) return;
    }
    element.init(
      this.tempElementId,
      this.tempElementSize,
      this.tempElementOffset,
      this.overallPointer
    );
    this.tempElementId = null;
    this.tempElementSize = null;
    this.tempElementOffset = null;
  }

  /*
   * Check if we have enough bytes available in the buffer to read
   * @param {number} n test if we have this many bytes available to read
   * @returns {boolean} has enough bytes to read
   */
  peekBytes(n) {
    if (this.remainingBytes - n >= 0) return true;
    return false;
  }

  /**
   * Skips set amount of bytes
   * TODO: Make this more efficient with skipping over different buffers, add stricter checking
   * @param {number} bytesToSkip
   */
  async skipBytes(bytesToSkip) {
    let chunkToErase = 0;
    if (this.tempCounter === INITIAL_COUNTER) this.tempCounter = 0;
    while (this.tempCounter < bytesToSkip) {
      if (!this.currentBuffer) return false;
      if (bytesToSkip - this.tempCounter > this.remainingBytes) {
        chunkToErase = this.remainingBytes;
      } else {
        chunkToErase = bytesToSkip - this.tempCounter;
      }
      await this.incrementPointers(chunkToErase);
      this.tempCounter += chunkToErase;
    }
    this.tempCounter = INITIAL_COUNTER;
    return true;
  }

  getRemainingBytes() {
    if (!this.currentBuffer) return 0;
    return this.currentBuffer.byteLength - this.internalPointer;
  }

  calculateOctetWidth() {
    let leadingZeroes = 0;
    let zeroMask = 0x80;
    do {
      if (this.tempOctet & zeroMask) break;
      zeroMask = zeroMask >> 1;
      leadingZeroes++;
    } while (leadingZeroes < 8);
    return leadingZeroes + 1;
  }

  async incrementPointers(n) {
    const bytesToAdd = n || 0;
    this.internalPointer += bytesToAdd;
    this.overallPointer += bytesToAdd;
    await this.popBuffer();
  }

  async readUnsignedInt(size) {
    if (!this.currentBuffer) {
      return null;
    }
    //need to fix overflow for 64bit unsigned int
    if (size <= 0 || size > 8) {
      console.warn("invalid file size");
    }
    if (this.tempResult === null) this.tempResult = BigInt(0);
    if (this.tempCounter === INITIAL_COUNTER) this.tempCounter = 0;
    let b;
    while (this.tempCounter < size) {
      if (!this.currentBuffer) return null;
      b = BigInt(await this.readByte());
      if (this.tempCounter === 0 && b < 0) {
        console.warn("invalid integer value");
      }
      this.tempResult <<= BigInt(8);
      this.tempResult |= b;
      await this.popBuffer();
      this.tempCounter++;
    }
    let result = Number(this.tempResult);
    this.tempResult = null;
    this.tempCounter = INITIAL_COUNTER;
    return result;
  }

  async readSignedInt(size) {
    if (!this.currentBuffer) {
      return null;
    }
    //need to fix overflow for 64bit unsigned int
    if (size <= 0 || size > 8) {
      console.warn("invalid file size");
    }
    if (this.tempResult === null) this.tempResult = BigInt(0);
    if (this.tempCounter === INITIAL_COUNTER) this.tempCounter = 0;
    let b;
    while (this.tempCounter < size) {
      if (!this.currentBuffer) return null;
      if (this.tempCounter === 0) {
        b = BigInt(await this.readByte());
      } else {
        b = BigInt(await this.readSignedByte());
      }
      this.tempResult <<= BigInt(8);
      this.tempResult |= b;
      await this.popBuffer();
      this.tempCounter++;
    }
    let result = Number(this.tempResult);
    this.tempResult = null;
    this.tempCounter = INITIAL_COUNTER;
    return result;
  }

  async readString(size) {
    if (!this.tempString) this.tempString = "";
    if (this.tempCounter === INITIAL_COUNTER) this.tempCounter = 0;
    let tempString = "";
    while (this.tempCounter < size) {
      if (!this.currentBuffer) {
        this.tempString += tempString;
        return null;
      }
      tempString += String.fromCharCode(await this.readByte());
      await this.popBuffer();
      this.tempCounter++;
    }
    this.tempString += tempString;
    const retString = this.tempString;
    this.tempString = null;
    this.tempCounter = INITIAL_COUNTER;
    return retString;
  }

  async readFloat(size) {
    if (size === 8) {
      if (this.tempCounter === INITIAL_COUNTER) this.tempCounter = 0;
      if (this.tempResult === null) {
        this.tempResult = 0;
        this.tempFloat64.setFloat64(0, 0);
      }
      let b;
      while (this.tempCounter < size) {
        if (!this.currentBuffer) return null;
        b = await this.readByte();
        this.tempFloat64.setUint8(this.tempCounter, b);
        await this.popBuffer();
        this.tempCounter++;
      }
      this.tempResult = this.tempFloat64.getFloat64(0);
    } else if (size === 4) {
      if (this.tempCounter === INITIAL_COUNTER) this.tempCounter = 0;
      if (this.tempResult === null) {
        this.tempResult = 0;
        this.tempFloat32.setFloat32(0, 0);
      }
      let b;
      while (this.tempCounter < size) {
        if (!this.currentBuffer) return null;
        b = await this.readByte();
        this.tempFloat32.setUint8(this.tempCounter, b);
        await this.popBuffer();
        this.tempCounter++;
      }
      this.tempResult = this.tempFloat32.getFloat32(0);
    } else {
      console.warn("INVALID FLOAT LENGTH");
      return null;
    }
    let result = this.tempResult;
    this.tempResult = null;
    this.tempCounter = INITIAL_COUNTER;
    return result;
  }

  /**
   * Returns a new buffer with the length of data starting at the current byte buffer
   * @param {number} length Length of bytes to read
   * @returns {ArrayBuffer} the read data
   */
  async getBinary(length) {
    if (!this.currentBuffer) {
      return null;
    }
    if (this.usingBufferedRead && this.tempCounter === null) {
      console.warn("COUNTER WAS ERASED");
      return null;
    }
    //Entire element contained in 1 array
    if (this.remainingBytes >= length && !this.usingBufferedRead) {
      if (!this.currentBuffer) return null;
      let newBuffer = this.currentBuffer.buffer.slice(
        this.internalPointer,
        this.internalPointer + length
      );
      await this.incrementPointers(length);
      return newBuffer;
    }

    if (this.usingBufferedRead === false && this.tempCounter > 0) {
      console.warn("INVALID BUFFERED READ"); //at this point should be true
      return null;
    }
    //data is broken up across different arrays
    //TODO: VERY SLOW, FIX THIS!!!!!!!!!!
    this.usingBufferedRead = true;
    if (!this.tempBinaryBuffer) this.tempBinaryBuffer = new Uint8Array(length);
    if (this.tempCounter === INITIAL_COUNTER) this.tempCounter = 0;
    let bytesToCopy = 0;
    let tempBuffer;
    while (this.tempCounter < length) {
      if (!this.currentBuffer) {
        if (this.usingBufferedRead === false) {
          return null;
        }
        return null;
      }
      if (length - this.tempCounter >= this.remainingBytes) {
        bytesToCopy = this.remainingBytes;
      } else {
        bytesToCopy = length - this.tempCounter;
      }
      tempBuffer = new Uint8Array(
        this.currentBuffer.buffer,
        this.internalPointer,
        bytesToCopy
      );
      this.tempBinaryBuffer.set(tempBuffer, this.tempCounter);
      await this.incrementPointers(bytesToCopy);
      this.tempCounter += bytesToCopy;
    }

    if (this.tempCounter !== length) console.warn("invalid read");
    let tempBinaryBuffer = this.tempBinaryBuffer;
    this.tempBinaryBuffer = null;
    this.tempCounter = INITIAL_COUNTER;
    this.usingBufferedRead = false;
    if (tempBinaryBuffer.buffer === null) {
      console.warn("Missing buffer");
      return null;
    }
    return tempBinaryBuffer.buffer;
  }
}

module.exports = DataInterface;
