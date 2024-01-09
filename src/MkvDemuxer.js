const DataInterface = require("./DataInterface");
const SeekHead = require("./SeekHead");
const SegmentInfo = require("./SegmentInfo");
const Tracks = require("./Tracks");
const Cluster = require("./Cluster");
const Cues = require("./Cues");
const ElementHeader = require("./ElementHeader");
const { findClosestNumber, findNumber } = require("./utils/tools");
const {
  MAIN_ElEMENT_ID,
  MAIN_ElEMENT_ID_STRING,
} = require("./utils/constants");
const { ERROR_TYPE } = require("./utils/error");
// todo：ebml stream
// todo：tags、chapters、attachments

/**
 * @classdesc Wrapper class to handle matroska demuxing
 */
class MkvDemuxer {
  constructor() {
    this.dataInterface = new DataInterface(this);
    this.currentElementHeader = new ElementHeader(-1, -1, -1, -1);
    this.currentElementHeader.reset();

    this.elementEBML = null;
    this.segment = null;
    this.seekHead = null;
    this.info = null;
    this.tracks = null;
    this.clusters = null;
    this.cues = null;
    this.currentCluster = null;
    this.topElementPosition = {
      [MAIN_ElEMENT_ID_STRING.INFO]: null,
      [MAIN_ElEMENT_ID_STRING.TRACKS]: null,
      [MAIN_ElEMENT_ID_STRING.CUES]: null,
    };

    this.videoTrack = null;
    this.audioTrack = null;
    this.videoPackets = [];
    this.audioPackets = [];

    this.isEBMLLoaded = false;
    this.isEBMLHeaderLoaded = false;
    this.isEBMLSegmentLoaded = false;
    this.isEBMLSeekHeadLoaded = false;
    this.isEBMLInfoLoaded = false;
    this.isEBMLTracksLoaded = false;
    this.isEBMLCuesLoaded = false;
    this.isEBMLClustersLoaded = false;

    this.isBasicElementsLoaded = false;
    this.isMetaLoaded = false;
    this.isDataLoaded = false;

    this.currentFileOffset = 0;
    this.file = null;
    this.fileSize = 0;
    this.filePieceSize = 1 * 1024 * 1024;

    Object.defineProperty(this, "duration", {
      get: function () {
        if (this.info.duration < 0) return -1;
        return this.info.duration / 1000;
      },
    });
  }

  reset() {
    this.dataInterface.flush();
    this.currentElementHeader = new ElementHeader(-1, -1, -1, -1);
    this.currentElementHeader.reset();

    this.elementEBML = null;
    this.segment = null;
    this.seekHead = null;
    this.info = null;
    this.tracks = null;
    this.clusters = null;
    this.cues = null;
    this.currentCluster = null;
    this.topElementPosition = {
      [MAIN_ElEMENT_ID_STRING.INFO]: null,
      [MAIN_ElEMENT_ID_STRING.TRACKS]: null,
      [MAIN_ElEMENT_ID_STRING.CUES]: null,
    };

    this.videoTrack = null;
    this.audioTrack = null;
    this.videoPackets = [];
    this.audioPackets = [];

    this.isEBMLLoaded = false;
    this.isEBMLHeaderLoaded = false;
    this.isEBMLSegmentLoaded = false;
    this.isEBMLSeekHeadLoaded = false;
    this.isEBMLInfoLoaded = false;
    this.isEBMLTracksLoaded = false;
    this.isEBMLCuesLoaded = false;
    this.isEBMLClustersLoaded = false;

    this.isBasicElementsLoaded = false;
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
    this.filePieceSize = filePieceSize;
    await this.dataInterface.recieveInput();
  }

  async getMeta() {
    if (!this.isBasicElementsLoaded) {
      await this._loadBasicElements();
    }
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
      cues: this.cues,
      videoPackets: this.videoPackets,
      audioPackets: this.audioPackets,
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

  async _loadBasicElements() {
    await this._loadEBML(true);
    await this._loadSeekHead();
    this.isBasicElementsLoaded = true;
  }

  async _loadEBML(skipHeader = false) {
    const name = "loadEBML";
    if (this.isEBMLLoaded) return;
    const dataInterface = this.dataInterface;
    // load header
    if (!this.isEBMLHeaderLoaded) {
      if (!this.elementEBML) {
        this.elementEBML = await dataInterface.peekElement();
        if (!this.elementEBML) {
          this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
        }
        if (this.elementEBML.id !== MAIN_ElEMENT_ID.EBML_HEADER) {
          this._handleError(ERROR_TYPE.NO_HEADER_ERROR, name);
        }
      }
      if (skipHeader) {
        const skipped = await this.dataInterface.skipBytes(
          this.elementEBML.end - dataInterface.offset
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
        case MAIN_ElEMENT_ID.SEGMENT:
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

  async _loadSeekHead() {
    const name = "loadSeekHead";
    if (this.isEBMLSeekHeadLoaded) return;
    while (
      this.dataInterface.offset < this.currentFileOffset &&
      !this.isEBMLSeekHeadLoaded
    ) {
      if (!this.currentElementHeader.status) {
        await this.dataInterface.peekAndSetElement(this.currentElementHeader);
        if (!this.currentElementHeader.status) {
          this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
        }
      }
      switch (this.currentElementHeader.id) {
        case MAIN_ElEMENT_ID.SEEK_HEAD:
          const ret = await this._parseSeekHead();
          if (!ret) {
            this._handleError(ERROR_TYPE.PARSE_SEEKHEAD_ERROR, name);
          }
          this.isEBMLSeekHeadLoaded = true;
          this._getTopELementDetails();
          break;
        default:
          var skipped = await this.dataInterface.skipBytes(
            this.currentElementHeader.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
      this.currentElementHeader.reset();
    }
  }

  async _loadInfo() {
    const name = "loadInfo";
    if (this.isEBMLInfoLoaded) return;
    const position = this.topElementPosition[MAIN_ElEMENT_ID_STRING.INFO] || 0;
    await this._jumpToSegmentOffset(position);
    while (
      this.dataInterface.offset < this.currentFileOffset &&
      !this.isEBMLInfoLoaded
    ) {
      if (!this.currentElementHeader.status) {
        await this.dataInterface.peekAndSetElement(this.currentElementHeader);
        if (!this.currentElementHeader.status) {
          this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
        }
      }
      switch (this.currentElementHeader.id) {
        case MAIN_ElEMENT_ID.INFO:
          const ret = await this._parseSegmentInfo();
          if (!ret) {
            this._handleError(ERROR_TYPE.PARSE_INFO_ERROR, name);
          }
          this.isEBMLInfoLoaded = true;
          break;
        default:
          var skipped = await this.dataInterface.skipBytes(
            this.currentElementHeader.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
      this.currentElementHeader.reset();
    }
  }

  async _loadTracks() {
    const name = "loadTracks";
    if (this.isEBMLTracksLoaded) return;
    const position =
      this.topElementPosition[MAIN_ElEMENT_ID_STRING.TRACKS] || 0;
    await this._jumpToSegmentOffset(position);
    while (
      this.dataInterface.offset < this.currentFileOffset &&
      !this.isEBMLTracksLoaded
    ) {
      if (!this.currentElementHeader.status) {
        await this.dataInterface.peekAndSetElement(this.currentElementHeader);
        if (!this.currentElementHeader.status) {
          this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
        }
      }
      switch (this.currentElementHeader.id) {
        case MAIN_ElEMENT_ID.TRACKS:
          const ret = await this._parseTracks();
          if (!ret) {
            this._handleError(ERROR_TYPE.PARSE_TRACKS_ERROR, name);
          }
          this.isEBMLTracksLoaded = true;
          this._getTracksDetails();
          break;
        default:
          var skipped = await this.dataInterface.skipBytes(
            this.currentElementHeader.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
      this.currentElementHeader.reset();
    }
  }

  async _loadCues() {
    const name = "loadCues";
    if (this.isEBMLCuesLoaded) return;
    const position = this.topElementPosition[MAIN_ElEMENT_ID_STRING.CUES] || 0;
    await this._jumpToSegmentOffset(position);
    while (
      this.dataInterface.offset < this.currentFileOffset &&
      !this.isEBMLCuesLoaded
    ) {
      if (!this.currentElementHeader.status) {
        await this.dataInterface.peekAndSetElement(this.currentElementHeader);
        if (!this.currentElementHeader.status) {
          this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
        }
      }
      switch (this.currentElementHeader.id) {
        case MAIN_ElEMENT_ID.CUES:
          const ret = await this._parseCues();
          if (!ret) {
            this._handleError(ERROR_TYPE.PARSE_CUES_ERROR, name);
          }
          this.isEBMLCuesLoaded = true;
          break;
        default:
          var skipped = await this.dataInterface.skipBytes(
            this.currentElementHeader.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
      this.currentElementHeader.reset();
    }
  }

  async _loadClusters() {
    const name = "loadClusters";
    if (this.isEBMLClustersLoaded) return;
    await this._jumpToSegmentOffset(0);
    while (this.dataInterface.offset < this.currentFileOffset) {
      if (!this.currentElementHeader.status) {
        await this.dataInterface.peekAndSetElement(this.currentElementHeader);
        if (!this.currentElementHeader.status) {
          // ****
          if (this.dataInterface.offset == this.fileSize) {
            break;
          } else {
            this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
          }
        }
      }
      switch (this.currentElementHeader.id) {
        case MAIN_ElEMENT_ID.CLUSTER:
          const ret = await this._parseCluster();
          if (!ret) {
            this._handleError(ERROR_TYPE.PARSE_CLUSTERS_ERROR, name);
          }
          break;
        default:
          const skipped = await this.dataInterface.skipBytes(
            this.currentElementHeader.size
          );
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
      this.currentElementHeader.reset();
    }
    this.isEBMLClustersLoaded = true;
  }

  async _loadClustersBlock(relativePosition) {
    const name = "loadClustersBlock";
    let blocks = [];
    if (!this.currentElementHeader.status) {
      await this.dataInterface.peekAndSetElement(this.currentElementHeader);
      if (!this.currentElementHeader.status) {
        this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
      }
    }
    if (this.currentElementHeader.id == MAIN_ElEMENT_ID.CLUSTER) {
      // currentcluster可以不要
      this.currentCluster = new Cluster(
        this.currentElementHeader.offset,
        this.currentElementHeader.size,
        this.currentElementHeader.end,
        this.currentElementHeader.dataOffset,
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
    this.currentElementHeader.reset();
    return blocks;
  }

  async _parseSeekHead() {
    if (!this.seekHead)
      this.seekHead = new SeekHead(
        this.currentElementHeader.getData(),
        this.dataInterface
      );
    await this.seekHead.load();
    if (!this.seekHead.loaded) return false;
    return true;
  }

  async _parseSegmentInfo() {
    if (!this.info) {
      this.info = new SegmentInfo(
        this.currentElementHeader.getData(),
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
        this.currentElementHeader.getData(),
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
        this.currentElementHeader.getData(),
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
      this.currentElementHeader.offset,
      this.currentElementHeader.size,
      this.currentElementHeader.end,
      this.currentElementHeader.dataOffset,
      this.dataInterface,
      this
    );
    await cluster.load();
    if (!cluster.loaded) return false;
    return true;
  }

  _getTopELementDetails() {
    const seekHeadEntries = this.seekHead.entries.map((each) => {
      return {
        id: "0x" + each.seekId.toString(16),
        size: each.size,
        position: each.seekPosition >>> 0,
      };
    });
    seekHeadEntries.forEach((each) => {
      this.topElementPosition[each.id] = each.position > 0 ? each.position : 0;
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
