export default class {

  constructor(ac, buffer) {
    this.ac = ac;
    this.gain = 1;
    this.buffer = buffer;
    this.destination = this.ac.destination;
    this.bol = false;
  }

  isPlaying() {
    return this.source !== undefined;
  }

  getDuration() {
    return this.buffer.duration;
  }

  setAudioContext(audioContext) {
    this.ac = audioContext;
    this.destination = this.ac.destination;
  }

  setUpSource() {
    this.source = this.ac.createBufferSource();
    this.source.buffer = this.buffer;

    const sourcePromise = new Promise((resolve) => {
      // keep track of the buffer state.
      this.source.onended = () => {
        this.source.disconnect();
        this.fadeGain.disconnect();
        this.volumeGain.disconnect();
        this.shouldPlayGain.disconnect();
        this.masterGain.disconnect();


        this.source = undefined;
        this.fadeGain = undefined;
        this.volumeGain = undefined;
        this.shouldPlayGain = undefined;
        this.masterGain = undefined;

        resolve();
      };
    });

    this.fadeGain = this.ac.createGain();
    // used for track volume slider
    this.volumeGain = this.ac.createGain();
    // used for solo/mute
    this.shouldPlayGain = this.ac.createGain();
    this.masterGain = this.ac.createGain();

    this.source.connect(this.fadeGain);
    this.fadeGain.connect(this.volumeGain);
    this.volumeGain.connect(this.shouldPlayGain);
    this.shouldPlayGain.connect(this.masterGain);
    this.masterGain.connect(this.destination);

    return sourcePromise;
  }

  setVolumeGainLevel(level) {
    if (this.volumeGain) {
      this.volumeGain.gain.value = level;
    }
  }

  setShouldPlay(bool) {
    if (this.shouldPlayGain) {
      this.shouldPlayGain.gain.value = bool ? 1 : 0;
    }
  }

  setMasterGainLevel(level) {
    if (this.masterGain) {
      this.masterGain.gain.value = level;
    }
  }

  // whens:延时 offset 片段内部偏移量 duration 持续时间
  // when：当前时间轴 start：开始时间 duration：持续时间 track：音频信息
  play(when, start, duration, track) {
    const onseTime = track.startTime;
    const playTime = when + onseTime;
    const offset = start - onseTime <= 0 ? 0 : start - onseTime;
    const whens = playTime - start <= 0 ? 0 : playTime - start;
    this.source.start(whens, offset, duration);
  }

  stop(track, now, when = 0) {
    if (this.source) {
      this.source.stop(when);
    }
  }
}
