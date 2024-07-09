const { DATA_TYPE } = require("./common");

const INFO_ElEMENT_NAME = {
  SEGMENT_UUID: "segmentUUID",
  SEGMENT_FILENAME: "segmentFilename",
  PREV_UUID: "prevUUID",
  PREV_FILENAME: "prevFilename",
  NEXT_UUID: "nextUUID",
  NEXT_FILENAME: "nextFilename",
  SEGMENT_FAMILY: "segmentFamily",
  CHAPTER_TRANSLATE: "chapterTranslate",
  TIMESTAMP_SCALE: "timestampScale",
  DURATION: "duration",
  DATE_UTC: "dateUTC",
  TITLE: "title",
  MUXING_APP: "muxingApp",
  WRITING_APP: "writingApp",
};

const INFO_ElEMENT_INFO = {
  0x73a4: { name: INFO_ElEMENT_NAME.SEGMENT_UUID, type: DATA_TYPE.BINARY },
  0x7384: { name: INFO_ElEMENT_NAME.SEGMENT_FILENAME, type: DATA_TYPE.UTF8 },
  0x3cb923: { name: INFO_ElEMENT_NAME.PREV_UUID, type: DATA_TYPE.BINARY },
  0x3c83ab: { name: INFO_ElEMENT_NAME.PREV_FILENAME, type: DATA_TYPE.UTF8 },
  0x3eb923: { name: INFO_ElEMENT_NAME.NEXT_UUID, type: DATA_TYPE.BINARY },
  0x3e83bb: { name: INFO_ElEMENT_NAME.NEXT_FILENAME, type: DATA_TYPE.UTF8 },
  0x4444: { name: INFO_ElEMENT_NAME.SEGMENT_FAMILY, type: DATA_TYPE.BINARY },
  0x6924: { name: INFO_ElEMENT_NAME.CHAPTER_TRANSLATE, type: DATA_TYPE.MASTER },
  0x2ad7b1: {
    name: INFO_ElEMENT_NAME.TIMESTAMP_SCALE,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x4489: { name: INFO_ElEMENT_NAME.DURATION, type: DATA_TYPE.FLOAT },
  0x4461: { name: INFO_ElEMENT_NAME.DATE_UTC, type: DATA_TYPE.DATE },
  0x7ba9: { name: INFO_ElEMENT_NAME.TITLE, type: DATA_TYPE.UTF8 },
  0x4d80: { name: INFO_ElEMENT_NAME.MUXING_APP, type: DATA_TYPE.UTF8 },
  0x5741: { name: INFO_ElEMENT_NAME.WRITING_APP, type: DATA_TYPE.UTF8 },
};

module.exports = { INFO_ElEMENT_NAME, INFO_ElEMENT_INFO };
