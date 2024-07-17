const DataInterface = require("./DataInterface");
const EBMLElement = require("./EBMLElement");
const SeekHead = require("./SeekHead");
const EBMLHeader = require("./EBMLHeader");
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
    this.segmentDataOffset = 0;

    this.videoTrack = null;
    this.audioTrack = null;
    this.videoPackets = [];
    this.audioPackets = [];

    this.isElementPositionLoaded = false;

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
    await this._getElementPosition();
  }

  async _getElementPosition() {
    if (this.isElementPositionLoaded) return;
    this.isElementPositionLoaded = true;
    await this._getSegmentPosition();
    await this._getTopELementPosition();
  }

  async _getSegmentPosition() {
    const name = "getSegmentPosition";
    const position = 0;
    await this._jumpToFileOffset(position);
    const dataInterface = this.dataInterface;
    const EBMLHeaderElement = await dataInterface.peekElement();
    if (!EBMLHeaderElement) {
      this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
    }
    if (EBMLHeaderElement.id !== MAIN_ELEMENT_ID.EBML_HEADER) {
      this._handleError(ERROR_TYPE.NO_HEADER_ERROR, name);
    }
    this.elementPositions[MAIN_ELEMENT_NAME.EBML_HEADER] =
      EBMLHeaderElement.offset >>> 0;

    let skipped = await dataInterface.skipBytes(
      EBMLHeaderElement.end - dataInterface.offset
    );
    if (skipped === false) {
      this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
    }
    const segmentElement = await dataInterface.peekElement();
    if (!segmentElement) {
      this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
    }
    if (segmentElement.id !== MAIN_ELEMENT_ID.SEGMENT) {
      this._handleError(ERROR_TYPE.NO_SEGMENT_ERROR, name);
    }
    this.elementPositions[MAIN_ELEMENT_NAME.SEGMENT] =
      segmentElement.offset >>> 0;
    this.segmentDataOffset = segmentElement.dataOffset;
  }

  async _getTopELementPosition() {
    await this._loadSeekHead();
    this.seekHead.getData().forEach((entryInfo) => {
      const elementName = Object.keys(MAIN_ELEMENT_ID_STRING).find(
        (elementName) => {
          return MAIN_ELEMENT_ID[elementName] === entryInfo.seekId;
        }
      );
      const elementPosition = entryInfo.seekPosition >>> 0;
      if (this.elementPositions[elementName] !== undefined) {
        this.elementPositions[elementName] =
          elementPosition > 0 ? elementPosition : 0;
      }
    });
  }

  async _getElement(name) {
    let flag = false;
    let element = null;
    while (this.dataInterface.offset < this.currentFileOffset && !flag) {
      const EBMLElement = await this.dataInterface.peekElement();
      if (!EBMLElement.status) {
        this._handleError(ERROR_TYPE.PICK_ELEMENT_ERROR, name);
      }
      switch (EBMLElement.id) {
        case MAIN_ELEMENT_ID[name]:
          flag = true;
          element = EBMLElement;
          break;
        default:
          const skipped = await this.dataInterface.skipBytes(EBMLElement.size);
          if (skipped === false) {
            this._handleError(ERROR_TYPE.SKIP_BYTE_ERROR, name);
          }
          break;
      }
    }
    return element;
  }

  async getEBMLHeader() {
    if (!this.isEBMLHeaderLoaded) {
      await this._loadEBMLHeader();
    }
    return this.EBMLHeader?.getData() || null;
  }

  async getSeekHead() {
    if (!this.isEBMLSeekHeadLoaded) {
      await this._loadSeekHead();
    }
    return this.seekHead?.getData() || null;
  }

  async getInfo() {
    if (!this.isEBMLInfoLoaded) {
      await this._loadInfo();
    }
    return this.info?.getData() || null;
  }

  async getTracks() {
    if (!this.isEBMLTracksLoaded) {
      await this._loadTracks();
    }
    return this.tracks?.getData() || null;
    }

  async _loadEBMLHeader() {
    const name = "loadEBMLHeader";
    if (this.isEBMLHeaderLoaded) return;
    this.isEBMLHeaderLoaded = true;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.EBML_HEADER] || 0;
    await this._jumpToFileOffset(position);
    const element = await this._getElement(MAIN_ELEMENT_NAME.EBML_HEADER);
    this.elementPositions[MAIN_ELEMENT_NAME.EBML_HEADER] =
      this.elementPositions[MAIN_ELEMENT_NAME.EBML_HEADER] ??
      element.offset >>> 0;
    const ret = await this._parseEBMLHeader(element);
    if (!ret) {
      this._handleError(ERROR_TYPE.PARSE_HEADER_ERROR, name);
    }
  }

  async _loadSeekHead() {
    const name = "loadSeekHead";
    if (this.isEBMLSeekHeadLoaded) return;
    this.isEBMLSeekHeadLoaded = true;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.SEEK_HEAD] || 0;
    await this._jumpToSegmentOffset(position);
    const element = await this._getElement(MAIN_ELEMENT_NAME.SEEK_HEAD);
    this.elementPositions[MAIN_ELEMENT_NAME.SEEK_HEAD] =
      this.elementPositions[MAIN_ELEMENT_NAME.SEEK_HEAD] ??
      element.offset >>> 0;
    const ret = await this._parseSeekHead(element);
    if (!ret) {
      this._handleError(ERROR_TYPE.PARSE_SEEKHEAD_ERROR, name);
    }
  }

  async _loadInfo() {
    const name = "loadInfo";
    if (this.isEBMLInfoLoaded) return;
    this.isEBMLInfoLoaded = true;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.INFO] || 0;
    await this._jumpToSegmentOffset(position);
    const element = await this._getElement(MAIN_ELEMENT_NAME.INFO);
    this.elementPositions[MAIN_ELEMENT_NAME.INFO] =
      this.elementPositions[MAIN_ELEMENT_NAME.INFO] ?? element.offset >>> 0;
    const ret = await this._parseINFO(element);
    if (!ret) {
      this._handleError(ERROR_TYPE.PARSE_INFO_ERROR, name);
    }
  }
  async _loadTracks() {
    const name = "loadTracks";
    if (this.isEBMLTracksLoaded) return;
    this.isEBMLTracksLoaded = true;
    const position = this.elementPositions[MAIN_ELEMENT_NAME.TRACKS] || 0;
    await this._jumpToSegmentOffset(position);
    const element = await this._getElement(MAIN_ELEMENT_NAME.TRACKS);
    this.elementPositions[MAIN_ELEMENT_NAME.TRACKS] =
      this.elementPositions[MAIN_ELEMENT_NAME.TRACKS] ?? element.offset >>> 0;
    const ret = await this._parseTracks(element);
    if (!ret) {
      this._handleError(ERROR_TYPE.PARSE_TRACKS_ERROR, name);
    }
  }

  async _parseEBMLHeader(element) {
    if (!this.EBMLHeader) {
      this.EBMLHeader = new EBMLHeader(element.getData(), this.dataInterface);
    }
    await this.EBMLHeader.load();
    if (!this.EBMLHeader.loaded) return false;
    return true;
  }

  async _parseSeekHead(element) {
    if (!this.seekHead) {
      this.seekHead = new SeekHead(element.getData(), this.dataInterface);
    }
    await this.seekHead.load();
    if (!this.seekHead.loaded) return false;
    return true;
  }

  async _parseINFO(element) {
    if (!this.info) {
      this.info = new Info(element.getData(), this.dataInterface);
    }
    await this.info.load();
    if (!this.info.loaded) return false;
    return true;
  }

  async _parseTracks(element) {
    if (!this.tracks) {
      this.tracks = new Tracks(element.getData(), this.dataInterface);
    }
    await this.tracks.load();
    if (!this.tracks.loaded) return false;
    return true;
  }

  async _jumpToFileOffset(position) {
    await this.dataInterface.jumpToPosition(position);
    if (this.dataInterface.overallPointer !== position) {
      this._handleError(ERROR_TYPE.JUMP_TO_POSITION_ERROR, "jumpToFileOffset");
    }
  }

  async _jumpToSegmentOffset(offset) {
    const position = this.segmentDataOffset + offset;
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
