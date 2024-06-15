import React from 'react';
import { useRef, useState, useEffect } from 'react';
import { RealtimeTranscriber } from 'assemblyai';
import { useDebouncedCallback } from 'use-debounce';
import RecordRTC from 'recordrtc';
import './App.css';
import { PlayhtLogo } from './components/PlayhtLogo';
import { Spinner } from './components/Spinner';

const DEFAULT_TEXT = 'Tell me a joke about AI.';

interface Texts {
  [key: number]: string;
}

function App() {
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const realtimeTranscriber = useRef<RealtimeTranscriber|null>(null)
  const recorder = useRef<RecordRTC|null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [token, setToken] = useState<string>('')

  const getToken = async () => {
    const response = await fetch('/api/aatoken');
    const data = await response.json();
    setToken(data.token);

    if (data.error) {
      alert(data.error)
    }

    return data.token;
  };

  useEffect(() => { getToken(); }, []);

  const debouncedTranscription = useDebouncedCallback(
    async () => {
        console.log("Sending text: ", transcript);
        await endTranscription(null);
        sayPrompt(transcript);
    },

    1500
  );

  useEffect(() => {
    if (transcript?.length > 0) {
      debouncedTranscription();
    }
   }, [transcript]);

  const startTranscription = async () => {
    realtimeTranscriber.current = new RealtimeTranscriber({
      token: token,
      sampleRate: 16_000,
    });

    if (!realtimeTranscriber.current) {
      console.error("Failed to initialize the RealtimeTranscriber.");
      return; // Exit if not properly initialized
    }

    const texts: Texts = {};
    realtimeTranscriber.current.on('transcript', transcript => {
      let msg = '';

      texts[transcript.audio_start] = transcript.text;
      const keys = Object.keys(texts).map(Number);;
      keys.sort((a, b) => a - b);
      for (const key of keys) {
        if (texts[key]) { 
          msg += ` ${texts[key]}`
          console.log(msg)
        }
      }
      
      setTranscript(msg)
    });

    realtimeTranscriber.current.on('error', event => {
      console.error(event);

      if (realtimeTranscriber.current) {
        realtimeTranscriber.current.close();
        realtimeTranscriber.current = null;
      }
    });

    realtimeTranscriber.current.on('close', (code, reason) => {
      console.log(`Connection closed: ${code} ${reason}`);
      realtimeTranscriber.current = null;
    });

    await realtimeTranscriber.current.connect();

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        recorder.current = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/webm;codecs=pcm',
          recorderType: RecordRTC.StereoAudioRecorder,
          timeSlice: 250,
          desiredSampRate: 16000,
          numberOfAudioChannels: 1,
          bufferSize: 4096,
          audioBitsPerSecond: 128000,
          ondataavailable: async (blob) => {
            if(!realtimeTranscriber.current) return;
            const buffer = await blob.arrayBuffer();
            realtimeTranscriber.current.sendAudio(buffer);
          },
        });
        recorder.current.startRecording();
      })
      .catch((err) => console.error(err));

    setIsRecording(true)
  }

  const endTranscription = async (event: React.MouseEvent<HTMLButtonElement> | null) => {
    event && event.preventDefault();
    setIsRecording(false)
    setTranscript('');

    if (recorder && recorder.current) {
      recorder.current.stopRecording();
      recorder.current = null;
    }

    if (realtimeTranscriber && realtimeTranscriber.current) {
      await realtimeTranscriber.current.close();
      realtimeTranscriber.current = null;
    }
  }

  const sayPrompt = (prompt: string) => {
    if (!audioRef.current) return;

    const onError = () => {
      setLoading(false);
      console.error('Error loading audio');
    };

    const onAudioEnd = () => {
      console.log('Audio playback completed');
      setLoading(false);
      setTranscript('');
      startTranscription();
    };

    try {
      const audioElement = audioRef.current;
      audioElement.pause();
      audioElement.currentTime = 0;

      const searchParams = new URLSearchParams();
      searchParams.set('prompt', prompt);
      setAudioSrc(`/api/say-prompt?${searchParams.toString()}`);
      setLoading(true);

      audioElement.load();

      const playAudio = () => {
        audioElement.play();
        setLoading(false);
      };

      audioElement.addEventListener('loadeddata', playAudio);
      audioElement.addEventListener('error', onError);
      audioElement.addEventListener('ended', onAudioEnd);

      return () => {
        audioElement.removeEventListener('loadeddata', playAudio);
        audioElement.removeEventListener('error', onError);
        audioElement.removeEventListener('ended', onAudioEnd);
      };
    } catch (error) {
      onError();
    }
  };

  return (
    <div className="App">
      <header>
        <h1 className="header__title">Real-Time Transcription</h1>
        <p className="header__sub-title">Try AssemblyAI's new real-time transcription endpoint!</p>
      </header>
      <div className="real-time-interface">
        <p id="real-time-title" className="real-time-interface__title">Click start to begin recording!</p>
        {isRecording ? (
          <button className="real-time-interface__button" onClick={endTranscription}>Stop recording</button>
        ) : (
          <button className="real-time-interface__button" onClick={startTranscription}>Record</button>
        )}
      </div>
      <div className="real-time-interface__message">
        {transcript}
      </div>
      <p>
        <audio className="w-full" ref={audioRef} src={audioSrc} controls />
      </p>
    </div>
  );
}

export default App;
