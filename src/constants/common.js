const MAIN_ElEMENT_NAME = {
  EBML_HEADER: 'EBML_HEADER',
  SEGMENT: 'SEGMENT',
  SEEK_HEAD: 'SEEK_HEAD',
  INFO: 'INFO',
  TRACKS: 'TRACKS',
  CUES: 'CUES',
  CLUSTER: 'CLUSTER',
  TAGS: 'TAGS',
  ATTACHMENTS: 'ATTACHMENTS',
  CHAPTERS: 'CHAPTERS',
  VOID: 'VOID',
};
const MAIN_ElEMENT_ID = {
  EBML_HEADER: 0x1a45dfa3,
  SEGMENT: 0x18538067,
  SEEK_HEAD: 0x114d9b74,
  INFO: 0x1549a966,
  TRACKS: 0x1654ae6b,
  CUES: 0x1c53bb6b,
  CLUSTER: 0x1f43b675,
  TAGS: 0x1254c367,
  ATTACHMENTS: 0x1941a469,
  CHAPTERS: 0x1043a770,
  VOID: 0xec,
};

const MAIN_ElEMENT_ID_STRING = {
  EBML_HEADER: "0x1a45dfa3",
  SEGMENT: "0x18538067",
  SEEK_HEAD: "0x114d9b74",
  INFO: "0x1549a966",
  TRACKS: "0x1654ae6b",
  CUES: "0x1c53bb6b",
  CLUSTER: "0x1f43b675",
  TAGS: "0x1254c367",
  ATTACHMENTS: "0x1941a469",
  CHAPTERS: "0x1043a770",
  VOID: "0xec",
};

const DATA_TYPE = {
  MASTER: "MASTER",
  UNSIGNED_INT: 'UNSIGNED_INT',
  SIGNED_INT: 'SIGNED_INT',
  FLOAT: "FLOAT",
  DATE: "DATE",
  UTF8: "UTF8",
  BINARY: "BINARY",
  STRING: "STRING",
}
module.exports = { MAIN_ElEMENT_NAME,MAIN_ElEMENT_ID, MAIN_ElEMENT_ID_STRING,DATA_TYPE };
