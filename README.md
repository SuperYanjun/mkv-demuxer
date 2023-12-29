# Mkv Demuxer

[mkv-demuxer](https://www.npmjs.com/package/mkv-demuxer) is a javascript library for demuxing `matroska, webm` files in the browser. It can be used to:

- Get media information of a video
- Get all frames of a video
- Get a certain frame at a given timestamp of a video

## Installation

```shell
npm install mkv-demuxer -S
```

## Usage

### Constructor

```javascript
import MkvDemuxer from 'mkv-demuxer'
const demuxer = new MkvDemuxer()
```

### API

#### initFile(file, filePieceSize)

Params:  `file, filePieceSize `

- file `File`  -  The file to be parsed
- filePieceSize `Number`  -  The file piece size parsed each time

```javascript
const filePieceSize = 1 * 1024 * 1024
await demuxer.initFile(file, filePieceSize)
```

#### getMeta()

Returns: `Promise<meta>`

- meta  -  The meta infomation of the file
  - info
    - duration `Number`
    - title `String`
    - ...
  - video
    - codecID `String`
    - codecPrivate `ArrayBuffer`
    - width `Number`
    - Height `Number`
    - displayWidth `Number`
    - displayHeight `Number`
    - language `String`
    - ...
  - Audio
    - codecID `String`
    - codecPrivate `ArrayBuffer`
    - bitDepth `Number`
    - channels `Number`
    - rate `Number`
    - ...

```javascript
const meta = await demuxer.getMeta()
```

#### getData()

To get all frames of a video.

Returns: `Promise<data>`

- data  -  The video data of the file
  - cues `Array`   -  The keyframes of the file
    - cueTime `Number`
    - cueTrackPositions
      - cueClusterPosition `Number`
      - cueRelativePosition `Number`
      - cueTrack `Number`
      - ...
    - ...
  - videoPackets `Array`
    - start `Number`
    - end `Number`
    - size `Number`
    - timestamp `Number`
    - isKeyframe `Boolean`
    - keyframeTimestamp `Number`
  - audioPackets `Array`
    - start `Number`
    - end `Number`
    - size `Number`
    - timestamp `Number`

```javascript
const data = await demuxer.getData()
```

#### seekFrame(timestamp)

Params: `timestamp`

- timestamp `number`

Returns: `Promise<frame>`

- frame
  - start `Number`
  - end `Number`
  - size `Number`
  - timestamp `Number`
  - isKeyframe `Boolean`
  - keyframeTimestamp `Number`

```javascript
const frame = await demuxer.seekFrame(10)
```

#### reset()

To reset the demuxer.

## Example

```javascript
import MkvDemuxer from 'mkv-demuxer'
const demuxer = new MkvDemuxer()
const filePieceSize = 1 * 1024 * 1024
await demuxer.initFile(file, filePieceSize)
const meta = await demuxer.getMeta()
const data = await demuxer.getData()
const frame = await demuxer.seekFrame(10)
```

## Additional notes

This library is based on [jswebm](https://github.com/jscodec/jswebm) and has made a series of optimizations. It solves the memory problem, optimizes exception handling, and provides several useful APIs.