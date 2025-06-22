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
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)       // en secondes
  const [currentTime, setCurrentTime] = useState(0) // en secondes

  // Format mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Métadatas chargées
  const handleLoaded = () => {
    const a = audioRef.current!
    setDuration(a.duration)
    onProgress?.(0)
  }

  // Mise à jour du temps
  const handleTimeUpdate = () => {
    const a = audioRef.current!
    setCurrentTime(a.currentTime)
    if (a.duration) {
      onProgress?.(a.currentTime / a.duration)
    }
  }

  // Fin de la piste
  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      onSelectTrack(currentIndex + 1)
    } else {
      setIsPlaying(false)
    }
  }

  // Jouer / pause
  useEffect(() => {
    const a = audioRef.current!
    if (isPlaying) {
      a.play().catch(() => {/* autoplay bloqué */})
    } else {
      a.pause()
    }
  }, [isPlaying, currentIndex])

  // Dès qu'on interagit, on lance
  useEffect(() => {
    if (hasInteracted) setIsPlaying(true)
  }, [hasInteracted, currentIndex])

  // Skip précédent / suivant
  const prevTrack = () => currentIndex > 0 && onSelectTrack(currentIndex - 1)
  const nextTrack = () => currentIndex < playlist.length - 1 && onSelectTrack(currentIndex + 1)

  // Seek via slider
  const handleSeek = (val: number) => {
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
          onClick={() => setIsPlaying(!isPlaying)}
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
          onChange={handleSeek}
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
        onLoadedMetadata={handleLoaded}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{ display: 'none' }}
      />
    </Box>
  )
}
