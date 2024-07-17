const { DATA_TYPE } = require("./common");

const SEEK_HEAD_ELEMENT_NAME = {
  SEEK: "seek",
};

const SEEK_HEAD_ELEMENT_INFO = {
  0x4dbb: { name: SEEK_HEAD_ELEMENT_NAME.SEEK, type: DATA_TYPE.MASTER },
};

const SEEK_ELEMENT_NAME = {
  SEEK_ID: "seekId",
  SEEK_POSITION: "seekPosition",
};

const SEEK_ELEMENT_INFO = {
  0x53ab: { name: SEEK_ELEMENT_NAME.SEEK_ID, type: DATA_TYPE.UNSIGNED_INT },
  0x53ac: {
    name: SEEK_ELEMENT_NAME.SEEK_POSITION,
    type: DATA_TYPE.UNSIGNED_INT,
  },
};

module.exports = {
  SEEK_HEAD_ELEMENT_NAME,
  SEEK_HEAD_ELEMENT_INFO,
  SEEK_ELEMENT_NAME,
  SEEK_ELEMENT_INFO,
};
