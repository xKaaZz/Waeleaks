import { useEffect, useRef, useState } from 'react'
import {
  Box,
  IconButton,
  HStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react'
import { FiPlay, FiPause, FiSkipBack, FiSkipForward } from 'react-icons/fi'

interface Sound {
  title: string
  url: string
}

interface AudioPlayerProps {
  playlist: Sound[]
  currentIndex: number
  onSelectTrack: (idx: number) => void
  hasInteracted: boolean
  onProgress?: (progress: number) => void
}

export default function AudioPlayer({
  playlist,
  currentIndex,
  onSelectTrack,
  hasInteracted,
  onProgress,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying]   = useState(false)
  const [duration, setDuration]     = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // Format mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Quand metadata chargée
  const onLoadedMetadata = () => {
    const a = audioRef.current!
    setDuration(a.duration)
    onProgress?.(0)
  }

  // À chaque update de temps
  const onTimeUpdate = () => {
    const a = audioRef.current!
    setCurrentTime(a.currentTime)
    if (a.duration > 0) onProgress?.(a.currentTime / a.duration)
  }

  // À la fin : skip ou pause
  const onEnded = () => {
    if (currentIndex < playlist.length - 1) {
      onSelectTrack(currentIndex + 1)
      // on repartira en play auto car hasInteracted = true
    } else {
      setIsPlaying(false)
    }
  }

  // Handlers play/pause via clic (événement utilisateur)
  const togglePlay = () => {
    const a = audioRef.current!
    if (!isPlaying) {
      a.play().catch(() => {
        /* Safari iOS peut rejeter si pas inline, mais on a playsInline */
      })
      setIsPlaying(true)
    } else {
      a.pause()
      setIsPlaying(false)
    }
  }

  // Skip précédent / suivant
  const prevTrack = () => {
    if (currentIndex > 0) onSelectTrack(currentIndex - 1)
  }
  const nextTrack = () => {
    if (currentIndex < playlist.length - 1) onSelectTrack(currentIndex + 1)
  }

  // Quand on change de piste, on relance si déjà interagi
  useEffect(() => {
    if (hasInteracted && audioRef.current) {
      // play automatique sur piste suivante
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [currentIndex, hasInteracted])

  // Seek via slider
  const onSeek = (val: number) => {
    const a = audioRef.current!
    a.currentTime = val
    setCurrentTime(val)
    onProgress?.(val / a.duration)
  }

  return (
    <Box borderWidth="1px" p={4} borderRadius="md" bg="white" w="100%">
      <HStack spacing={4}>
        <IconButton
          aria-label="Précédent"
          icon={<FiSkipBack />}
          onClick={prevTrack}
          isDisabled={currentIndex === 0}
        />
        <IconButton
          aria-label={isPlaying ? 'Pause' : 'Play'}
          icon={isPlaying ? <FiPause /> : <FiPlay />}
          onClick={togglePlay}
        />
        <IconButton
          aria-label="Suivant"
          icon={<FiSkipForward />}
          onClick={nextTrack}
          isDisabled={currentIndex === playlist.length - 1}
        />
        <Text fontWeight="bold">{playlist[currentIndex].title}</Text>
      </HStack>

      <HStack mt={4} spacing={3}>
        <Text minW="40px">{formatTime(currentTime)}</Text>
        <Slider
          value={currentTime}
          min={0}
          max={duration}
          flex="1"
          step={0.1}
          onChange={onSeek}
        >
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg="teal.500" />
          </SliderTrack>
          <SliderThumb boxSize={4} />
        </Slider>
        <Text minW="40px">{formatTime(duration)}</Text>
      </HStack>

      <audio
        ref={audioRef}
        src={playlist[currentIndex].url}
        playsInline
        webkit-playsinline="true"
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        style={{ display: 'none' }}
      />
    </Box>
  )
}
