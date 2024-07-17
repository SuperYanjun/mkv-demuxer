const DataInterface = require("./DataInterface");
const EBMLElement = require("./EBMLElement");
const SeekHead = require("./SeekHead");
const Info = require("./Info");
const Tracks = require("./Tracks");
const Cluster = require("./Cluster");
const Cues = require("./Cues");
const { findClosestNumber, findNumber } = require("./utils/tools");
const {
  MAIN_ELEMENT_NAME,
  MAIN_ELEMENT_ID,
  MAIN_ELEMENT_ID_STRING,
} = require("./constants/common");
const { ERROR_TYPE } = require("./utils/error");
// todo：ebml stream
// todo：tags、chapters、attachments

class MkvDemuxer {
  constructor() {
    this.dataInterface = new DataInterface(this);
    this.currentEBMLElement = new EBMLElement(-1, -1, -1, -1);
    this.currentEBMLElement.reset();
    this.resetProperties();
  }

  reset() {
    this.dataInterface.reset();
    this.currentEBMLElement = new EBMLElement(-1, -1, -1, -1);
    this.currentEBMLElement.reset();
    this.resetProperties();
  }

  resetProperties() {
    this.EBMLHeader = null;
    this.segment = null;
    this.seekHead = null;
    this.info = null;
    this.tracks = null;
    this.clusters = null;
    this.cues = null;
    this.currentCluster = null;
    this.tags = null;
    this.attachments = null;
    this.chapters = null;
    this.elementPositions = {
      [MAIN_ELEMENT_NAME.EBML_HEADER]: null,
      [MAIN_ELEMENT_NAME.SEGMENT]: null,
      [MAIN_ELEMENT_NAME.SEEK_HEAD]: null,
      [MAIN_ELEMENT_NAME.INFO]: null,
      [MAIN_ELEMENT_NAME.TRACKS]: null,
      [MAIN_ELEMENT_NAME.CUES]: null,
      [MAIN_ELEMENT_NAME.CLUSTER]: null,
      [MAIN_ELEMENT_NAME.TAGS]: null,
      [MAIN_ELEMENT_NAME.ATTACHMENTS]: null,
      [MAIN_ELEMENT_NAME.CHAPTERS]: null,
    };

    this.videoTrack = null;
    this.audioTrack = null;
    this.videoPackets = [];
    this.audioPackets = [];

    this.isElementPositionLoaded = false;
    // this.isEBMLLoaded = false;
    this.isEBMLHeaderLoaded = false;
    this.isEBMLSegmentLoaded = false;
    this.isEBMLSeekHeadLoaded = false;
    this.isEBMLInfoLoaded = false;
    this.isEBMLTracksLoaded = false;
    this.isEBMLCuesLoaded = false;
    this.isEBMLClustersLoaded = false;
    this.isEBMLTagsLoaded = false;
    this.isEBMLAttachmentsLoaded = false;
    this.isEBMLChaptersLoaded = false;

    // this.isBasicElementsLoaded = false;
    this.isMetaLoaded = false;
    this.isDataLoaded = false;

    this.currentFileOffset = 0;
    this.file = null;
    this.fileSize = 0;
    this.filePieceSize = 1 * 1024 * 1024;
  }

  async initFile(file, filePieceSize) {
    if (this.file) {
      this.reset();
    }
    this.file = file;
    this.fileSize = file.size;
    this.filePieceSize = filePieceSize || 1 * 1024 * 1024;
    await this.dataInterface.receiveInput();
    await this._getElementPositions();
  }

  async getEBMLHeader() {
    if (!this.isEBMLHeaderLoaded) {
      await this._loadEBMLHeader();
    }
    return this.EBMLHeader;
  }
  async getSegments() {
    if (!this.isEBMLSegmentLoaded) {
      await this._loadSegment();
    }
    return this.segment;
  }

  async getSeekHead() {
    if (!this.isEBMLSeekHeadLoaded) {
      await this._loadSeekHead();
    }
    return this.seekHead;
  }

  async getInfo() {
    // if (!this.isBasicElementsLoaded) {
    //   await this._loadBasicElements();
    // }
    // if (!this.isBasicElementsLoaded) {
    //   await this._loadBasicElements();
    // }
    if (!this.isEBMLInfoLoaded) {
      await this._loadInfo();
    }
    return this.info;
  }
  async getTracks() {
    // if (!this.isBasicElementsLoaded) {
    //   await this._loadBasicElements();
    // }
    if (!this.isEBMLTracksLoaded) {
      await this._loadTracks();
    }
    return this.tracks;
  }
  async getCues() {
    // if (!this.isBasicElementsLoaded) {
    //   await this._loadBasicElements();
    // }
    if (!this.isEBMLCuesLoaded) {
      await this._loadCues();
    }
    return this.cues;
  }
  async getClusters() {
    // if (!this.isBasicElementsLoaded) {
    //   await this._loadBasicElements();
    // }
    if (!this.isEBMLClustersLoaded) {
      await this._loadClusters();
    }
    return this.clusters;
  }
  async getTags() {
    // if (!this.isBasicElementsLoaded) {
    //   await this._loadBasicElements();
    // }
    if (!this.isEBMLTagsLoaded) {
      await this._loadTags();
    }
    return this.tags;
  }
  async getAttachments() {
    // if (!this.isBasicElementsLoaded) {
    //   await this._loadBasicElements();
    // }
    if (!this.isEBMLAttachmentsLoaded) {
      await this._loadAttachments();
    }
    return this.attachments;
  }
  async getChapters() {
    // if (!this.isBasicElementsLoaded) {
    //   await this._loadBasicElements();
    // }
    if (!this.isEBMLChaptersLoaded) {
      await this._loadChapters();
    }
    return this.chapters;
  }

  async getMeta() {
    // if (!this.isBasicElementsLoaded) {
    //   await this._loadBasicElements();
    // }
    if (!this.isEBMLInfoLoaded) {
      await this._loadInfo();
    }
    if (!this.isEBMLTracksLoaded) {
      await this._loadTracks();
    }
    this.isMetaLoaded = true;
    const meta = {
      info: this.info,
      audio: this.audioTrack,
      video: this.videoTrack,
    };
    return meta;
  }

  async getData() {
    if (!this.isMetaLoaded) {
      await this.getMeta();
    }
    if (!this.isEBMLCuesLoaded) {
      await this._loadCues();
    }
    if (!this.isEBMLClustersLoaded) {
      await this._loadClusters();
    }
    this.isDataLoaded = true;
    const data = {
      cues: this.cues.entries || [],
      videoPackets: this.videoPackets || [],
      audioPackets: this.audioPackets || [],
    };
    return data;
  }

  async seekFrame(timestamp) {
    if (!this.isMetaLoaded) {
      await this.getMeta();
    }
    if (!this.isEBMLCuesLoaded) {
      await this._loadCues();
    }
    const frame = await this._seek(timestamp);
    return frame;
  }

  async _seek(timestamp) {
    const cues = this.cues?.entries || [];
    if (cues.length == 0) return null;
    const milliTime = timestamp * 1000;
    const closestIndex = findClosestNumber(
      cues.map((each) => each.cueTime),
      milliTime
    );
    const exactTime = cues[closestIndex]?.cueTime / 1000 || 0;
    const clusterRelativePosition =
      cues[closestIndex].cueTrackPositions?.cueClusterPosition || 0;
    const blockRelativePosition =
      cues[closestIndex].cueTrackPositions?.cueRelativePosition || 0;
    if (!clusterRelativePosition) {
      return null;
    }
    await this._jumpToSegmentOffset(clusterRelativePosition);
    const blocks = (await this._loadClustersBlock(blockRelativePosition)) || [];
    let frameIndex = findNumber(
      blocks.map((each) => each?.timestamp || 0),
      exactTime
    );
    frameIndex = frameIndex >= 0 ? frameIndex : -1;
    const frame = blocks?.[frameIndex] || null;
    return frame;
  }

  async _getElementPositions() {
    const name = "getElementPosition";
    if (this.isElementPositionLoaded) return;
    const position = 0;
    await this._jumpToFileOffset(position);
    const dataInterface = this.dataInterface;

    this.EBMLHeader = await dataInterface.peekElement();
    if (!this.EBMLHeader) {
      this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
    }
    if (this.EBMLHeader.id !== MAIN_ELEMENT_ID.EBML_HEADER) {
      this._handleError(ERROR_TYPE.NO_HEADER_ERROR, name);
    }
    this.elementPositions[MAIN_ELEMENT_NAME.EBML_HEADER] =
      this.EBMLHeader.offset >>> 0;

    let skipped = await dataInterface.skipBytes(
      this.EBMLHeader.end - dataInterface.offset
    );
    if (skipped === false) {
      this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
    }

    this.segment = await dataInterface.peekElement();
    if (!this.segment) {
      this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
    }
    if (this.segment.id !== MAIN_ELEMENT_ID.SEGMENT) {
      this._handleError(ERROR_TYPE.NO_SEGMENT_ERROR, name);
    }
    this.elementPositions[MAIN_ELEMENT_NAME.SEGMENT] =
      this.segment.offset >>> 0;
    // await this._jumpToSegmentOffset(0);
    // const element =await this._getElement(MAIN_ELEMENT_NAME.SEEK_HEAD)

    // let flag = false;
    // while (this.currentFileOffset < this.fileSize && !flag) {
    //   const element = await dataInterface.peekElement();
    //   if (!element) {
    //     this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
    //   }
    //   switch (element.id) {
    //     case MAIN_ELEMENT_ID.SEEK_HEAD:
    //       flag = true;
    //       if (!this.elementPositions[MAIN_ELEMENT_NAME.SEEK_HEAD]) {
    //         this.elementPositions[MAIN_ELEMENT_NAME.SEEK_HEAD] =
    //           element.offset >>> 0;
    //       }
    //       await this._loadSeekHead();
    //     this._getTopELementPositions();
    //     break;
    //     default:
    //       skipped = await dataInterface.skipBytes(element.size);
    //       if (skipped === false) {
    //         this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
    //       }
    //       break;
    //   }
    // }
    await this._getTopELementPositions();
    this.isElementPositionLoaded = true;
  }

  async _loadBasicElements() {
    await this._loadEBML(true);
    await this._loadSeekHead();
    this.isBasicElementsLoaded = true;
  }
  async _getElement(name) {
    let flag = false;
    let element = null
    while (this.dataInterface.offset < this.currentFileOffset && !flag) {
      const EBMLElement = await this.dataInterface.peekElement();
      if (!EBMLElement.status) {
        this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
      }
      switch (EBMLElement.id) {
        case MAIN_ELEMENT_ID[name]:
          flag = true;
          element = EBMLElement
          break;
          // return EBMLElement;
        default:
          const skipped = await this.dataInterface.skipBytes(EBMLElement.size);
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }

      // EBMLElement.reset();
    }
    return element
  }
  async _loadEBMLHeader() {
    const name = "loadEBMLHeader";
    if (this.isEBMLHeaderLoaded) return;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.EBML_HEADER] || 0;
    await this._jumpToFileOffset(position);
    const EBMLHeader = await _getElement("EBMLHeader");
    this._parseEBMLHeader(EBMLHeader);
    this.isEBMLHeaderLoaded = true;
  }

  async _loadSegment() {
    const name = "loadSegment";
    if (this.isEBMLSegmentLoaded) return;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.SEGMENT] || 0;
    await this._jumpToFileOffset(position);
    const segment = await _getElement("segment");
    this._parseSegment(segment);
    this.isEBMLSegmentLoaded = true;
  }

  async _loadSeekHead() {
    const name = "loadSeekHead";
    if (this.isEBMLSeekHeadLoaded) return;
    const position =
      this.elementPositions[MAIN_ELEMENT_NAME.SEEK_HEAD] ||
      this.elementPositions.SEGMENT;
    await this._jumpToFileOffset(position);
    const element = await this._getElement(MAIN_ELEMENT_NAME.SEEK_HEAD);
    this.elementPositions[MAIN_ELEMENT_NAME.SEEK_HEAD] =
    element.offset >>> 0;

    const ret = await this._parseSeekHead(element);
    if (!ret) {
      this._handleError(ERROR_TYPE.PARSE_SEEKHEAD_ERROR, name);
    }
    this.isEBMLSeekHeadLoaded = true;
  }

  async _loadInfo() {
    const name = "loadInfo";
    if (this.isEBMLInfoLoaded) return;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.INFO] || 0;
    await this._jumpToFileOffset(position);
    await _getElement("info");
    const ret = await this._parseInfo();
    if (!ret) {
      this._handleError(ERROR_TYPE.PARSE_SEEKHEAD_ERROR, name);
    }
    this.isEBMLInfoLoaded = true;
  }

  async _loadEBML(skipHeader = false) {
    const name = "loadEBML";
    if (this.isEBMLLoaded) return;
    const dataInterface = this.dataInterface;
    // load header
    if (!this.isEBMLHeaderLoaded) {
      if (!this.EBMLHeader) {
        this.EBMLHeader = await dataInterface.peekElement();
        if (!this.EBMLHeader) {
          this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
        }
        if (this.EBMLHeader.id !== MAIN_ELEMENT_ID.EBML_HEADER) {
          this._handleError(ERROR_TYPE.NO_HEADER_ERROR, name);
        }
      }
      if (skipHeader) {
        const skipped = await this.dataInterface.skipBytes(
          this.EBMLHeader.end - dataInterface.offset
        );
        if (skipped === false) {
          this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
        }
      } else {
      }
      this.isEBMLHeaderLoaded = true;
    }
    // load segment
    if (!this.isEBMLSegmentLoaded) {
      const currentElement = await this.dataInterface.peekElement();
      if (!currentElement.status) {
        this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
      }
      switch (currentElement.id) {
        case MAIN_ELEMENT_ID.SEGMENT:
          this.segment = currentElement;
          this.isEBMLSegmentLoaded = true;
          break;
        default:
          const skipped = await this.dataInterface.skipBytes(
            currentElement.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
    }
    this.isEBMLLoaded = true;
  }

  // async _loadSeekHead() {
  //   const name = "loadSeekHead";
  //   if (this.isEBMLSeekHeadLoaded) return;
  //   while (
  //     this.dataInterface.offset < this.currentFileOffset &&
  //     !this.isEBMLSeekHeadLoaded
  //   ) {
  //     if (!this.currentEBMLElement.status) {
  //       await this.dataInterface.peekAndSetElement(this.currentEBMLElement);
  //       if (!this.currentEBMLElement.status) {
  //         this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
  //       }
  //     }
  //     switch (this.currentEBMLElement.id) {
  //       case MAIN_ELEMENT_ID.SEEK_HEAD:
  //         const ret = await this._parseSeekHead();
  //         if (!ret) {
  //           this._handleError(ERROR_TYPE.PARSE_SEEKHEAD_ERROR, name);
  //         }
  //         this.isEBMLSeekHeadLoaded = true;
  //         this._getTopELementPositions();
  //         break;
  //       default:
  //         var skipped = await this.dataInterface.skipBytes(
  //           this.currentEBMLElement.size
  //         );
  //         if (skipped === false) {
  //           this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
  //         }
  //         break;
  //     }
  //     this.currentEBMLElement.reset();
  //   }
  // }

  async _loadInfo() {
    const name = "loadInfo";
    if (this.isEBMLInfoLoaded) return;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.INFO] || 0;
    await this._jumpToSegmentOffset(position);
    while (
      this.dataInterface.offset < this.currentFileOffset &&
      !this.isEBMLInfoLoaded
    ) {
      if (!this.currentEBMLElement.status) {
        await this.dataInterface.peekAndSetElement(this.currentEBMLElement);
        if (!this.currentEBMLElement.status) {
          this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
        }
      }
      switch (this.currentEBMLElement.id) {
        case MAIN_ELEMENT_ID.INFO:
          const ret = await this._parseInfo();
          if (!ret) {
            this._handleError(ERROR_TYPE.PARSE_INFO_ERROR, name);
          }
          this.isEBMLInfoLoaded = true;
          break;
        default:
          var skipped = await this.dataInterface.skipBytes(
            this.currentEBMLElement.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
      this.currentEBMLElement.reset();
    }
  }

  async _loadTracks() {
    const name = "loadTracks";
    if (this.isEBMLTracksLoaded) return;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.TRACKS] || 0;
    await this._jumpToSegmentOffset(position);
    while (
      this.dataInterface.offset < this.currentFileOffset &&
      !this.isEBMLTracksLoaded
    ) {
      if (!this.currentEBMLElement.status) {
        await this.dataInterface.peekAndSetElement(this.currentEBMLElement);
        if (!this.currentEBMLElement.status) {
          this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
        }
      }
      switch (this.currentEBMLElement.id) {
        case MAIN_ELEMENT_ID.TRACKS:
          const ret = await this._parseTracks();
          if (!ret) {
            this._handleError(ERROR_TYPE.PARSE_TRACKS_ERROR, name);
          }
          this.isEBMLTracksLoaded = true;
          this._getTracksDetails();
          break;
        default:
          var skipped = await this.dataInterface.skipBytes(
            this.currentEBMLElement.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
      this.currentEBMLElement.reset();
    }
  }

  async _loadCues() {
    const name = "loadCues";
    if (this.isEBMLCuesLoaded) return;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.CUES] || 0;
    await this._jumpToSegmentOffset(position);
    while (
      this.dataInterface.offset < this.currentFileOffset &&
      !this.isEBMLCuesLoaded
    ) {
      if (!this.currentEBMLElement.status) {
        await this.dataInterface.peekAndSetElement(this.currentEBMLElement);
        if (!this.currentEBMLElement.status) {
          this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
        }
      }
      switch (this.currentEBMLElement.id) {
        case MAIN_ELEMENT_ID.CUES:
          const ret = await this._parseCues();
          if (!ret) {
            this._handleError(ERROR_TYPE.PARSE_CUES_ERROR, name);
          }
          this.isEBMLCuesLoaded = true;
          break;
        default:
          const skipped = await this.dataInterface.skipBytes(
            this.currentEBMLElement.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
      this.currentEBMLElement.reset();
    }
  }

  async _loadClusters() {
    const name = "loadClusters";
    if (this.isEBMLClustersLoaded) return;
    await this._jumpToSegmentOffset(0);
    while (this.dataInterface.offset < this.currentFileOffset) {
      if (!this.currentEBMLElement.status) {
        await this.dataInterface.peekAndSetElement(this.currentEBMLElement);
        if (!this.currentEBMLElement.status) {
          // ****
          if (this.dataInterface.offset == this.fileSize) {
            break;
          } else {
            this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
          }
        }
      }
      switch (this.currentEBMLElement.id) {
        case MAIN_ELEMENT_ID.CLUSTER:
          const ret = await this._parseCluster();
          if (!ret) {
            this._handleError(ERROR_TYPE.PARSE_CLUSTERS_ERROR, name);
          }
          break;
        default:
          const skipped = await this.dataInterface.skipBytes(
            this.currentEBMLElement.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
      this.currentEBMLElement.reset();
    }
    this.isEBMLClustersLoaded = true;
  }

  async _loadClustersBlock(relativePosition) {
    const name = "loadClustersBlock";
    let blocks = [];
    if (!this.currentEBMLElement.status) {
      await this.dataInterface.peekAndSetElement(this.currentEBMLElement);
      if (!this.currentEBMLElement.status) {
        this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
      }
    }
    if (this.currentEBMLElement.id == MAIN_ELEMENT_ID.CLUSTER) {
      // currentcluster可以不要
      this.currentCluster = new Cluster(
        this.currentEBMLElement.offset,
        this.currentEBMLElement.size,
        this.currentEBMLElement.end,
        this.currentEBMLElement.dataOffset,
        this.dataInterface,
        this
      );
    }
    if (relativePosition) {
      await this.currentCluster.loadTimeCode();
      const blockPosition = this.currentCluster.dataOffset + relativePosition;
      await this._jumpToFileOffset(blockPosition);
      blocks = [await this.currentCluster.loadBlock()];
    } else {
      await this.currentCluster.loadTimeCode();
      blocks = await this.currentCluster.loadBlocks();
      blocks.sort((a, b) => {
        return a.timestamp - b.timestamp;
      });
    }
    this.currentEBMLElement.reset();
    return blocks;
  }

  async _parseSeekHead(element) {
    if (!this.seekHead) {
      this.seekHead = new SeekHead(element.getData(), this.dataInterface);
    }
    await this.seekHead.load();
    if (!this.seekHead.loaded) return false;
    return true;
  }

  async _parseInfo() {
    if (!this.info) {
      this.info = new Info(
        this.currentEBMLElement.getData(),
        this.dataInterface
      );
    }
    await this.info.load();
    if (!this.info.loaded) return false;
    return true;
  }

  async _parseTracks() {
    if (!this.tracks) {
      this.tracks = new Tracks(
        this.currentEBMLElement.getData(),
        this.dataInterface,
        this
      );
    }
    await this.tracks.load();
    if (!this.tracks.loaded) return false;
    return true;
  }

  async _parseCues() {
    if (!this.cues) {
      this.cues = new Cues(
        this.currentEBMLElement.getData(),
        this.dataInterface,
        this
      );
    }
    await this.cues.load();
    if (!this.cues.loaded) return false;
    return true;
  }

  async _parseCluster() {
    const cluster = new Cluster(
      this.currentEBMLElement.offset,
      this.currentEBMLElement.size,
      this.currentEBMLElement.end,
      this.currentEBMLElement.dataOffset,
      this.dataInterface,
      this
    );
    await cluster.load();
    if (!cluster.loaded) return false;
    return true;
  }

  async _getTopELementPositions() {
    await this._loadSeekHead();
    const seekHeadEntries = this.seekHead.seekEntries.map((each) => {
      return {
        id: "0x" + each.seekId.toString(16),
        size: each.size,
        position: each.seekPosition >>> 0,
      };
    });
    seekHeadEntries.forEach((each) => {
      this.elementPositions[each.id] = each.position > 0 ? each.position : 0;
    });
  }

  _getTracksDetails() {
    this.videoTrack =
      this.tracks.trackEntries.filter((track) => {
        return track.trackType === 1;
      })?.[0] || null;
    this.audioTrack =
      this.tracks.trackEntries.filter((track) => {
        return track.trackType === 2;
      })?.[0] || null;
  }

  async _jumpToFileOffset(position) {
    await this.dataInterface.jumpToPosition(position);
    if (this.dataInterface.overallPointer !== position) {
      this._handleError(ERROR_TYPE.JUMP_TO_POSITION_ERROR, "jumpToFileOffset");
    }
  }

  async _jumpToSegmentOffset(offset) {
    // if(this.)
    const position = this.segment.dataOffset + offset;
    await this.dataInterface.jumpToPosition(position);
    if (this.dataInterface.overallPointer !== position) {
      this._handleError(
        ERROR_TYPE.JUMP_TO_POSITION_ERROR,
        "jumpToSegmentOffset"
      );
    }
  }
  _handleError(type, scope) {
    throw {
      errorType: type,
      errorScope: scope,
    };
  }
}

module.exports = MkvDemuxer;
