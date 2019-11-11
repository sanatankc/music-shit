import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { notes } from './notes';
import keysToNotes from './keysToNotes'

class App extends Component {
  state = {
    octave: 5,
    value: 40
  }


  notesPlaying = []

  isArrowUp = false
  isArrowDown = false

  componentDidMount() {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    const { masterGain, audioContext } = this
    masterGain.connect(audioContext.destination);
    masterGain.gain.setTargetAtTime(0.2, audioContext.currentTime, 0.001);

    const  playNote = (startTime, key) => {
      let octave = this.state.octave
      let keyNote = keysToNotes[key]
      if (keyNote.startsWith('`')) {
        keyNote = keyNote.slice(1)
        octave = octave - 1
      }

      if (keyNote.endsWith('`')) {
        keyNote = keyNote.slice(0, -1)
        octave = octave + 1
      }
      const note =  keyNote + octave
      const freq = notes[note]
      console.log('playing note', note)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      oscillator.frequency.value = freq;
      oscillator.type = 'triangle';
      oscillator.start(startTime);
      this.notesPlaying.push({
        key: key,
        note: note,
        oscillator,
        gainNode
      })
    }

    window.addEventListener('keydown', e => {
      const key = e.key.toLowerCase()
      console.log('keydown', key)

      if (key === 'arrowdown' && !this.isArrowDown) {
        this.isArrowDown = true
        this.pitchDecrease = setInterval(() => {
          this.notesPlaying.forEach(notePlaying => {
            notePlaying.oscillator.frequency.value -= 10
          })
        }, 100)
      }
      if (key === 'arrowup' && !this.isArrowUp) {
        this.isArrowUp = true
        console.log('freq..doom doom', this.isArrowUp)
        this.pitchIncrease = setInterval(() => {
          this.notesPlaying.forEach(notePlaying => {
            console.log('freq..dancee')
            notePlaying.oscillator.frequency.value += 10
          })
        }, 100)
      }


      if (!Object.keys(keysToNotes).includes(key)) return null

      let isNotePlaying = false
      for (const notePlaying of this.notesPlaying) {
        if (notePlaying.key === key) {
          isNotePlaying = true
        }
      }

      if (!isNotePlaying) {
        playNote(audioContext.currentTime, key)
      }
    })


    window.addEventListener('keyup', e => {
      const key = e.key.toLowerCase()
      console.log('keyup', key)

      if (key === 'arrowdown') {
        this.isArrowDown = false
        clearInterval(this.pitchDecrease)
      }
      if (key === 'arrowup') {
        this.isArrowUp = false
        clearInterval(this.pitchIncrease)
      }

      if (!Object.keys(keysToNotes).includes(key)) return null

      this.notesPlaying.forEach((notePlaying, index) => {
        if (notePlaying.key === key) {
          notePlaying.gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.3);
          console.log('stoping note', notePlaying.note)
          this.notesPlaying = this.notesPlaying.filter((_, i) =>  i !== index)
        }
      })
      console.log(this.notesPlaying)
    })
  }
  render() {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#ee9090' }}>
        <input type="range" min="0" max="100" step="1" value={this.state.volume} onChange={(e) => {
          this.setState({ value: e.target.value })
          this.masterGain.gain.setTargetAtTime(e.target.value / 100, this.audioContext.currentTime, 0.001);
        }} />
      </div>
    )
  }
}

export default App;
