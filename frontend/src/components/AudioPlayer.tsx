import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Flex,
  IconButton,
  Text,
  Progress,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FiPlay,
  FiPause,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'

interface Sound {
  title: string
  url: string
}

interface AudioPlayerProps {
  playlist: Sound[]
  currentIndex: number
  onSelectTrack: (index: number) => void
  hasInteracted: boolean
  onProgress: (p: number) => void
}

export default function AudioPlayer({
  playlist,
  currentIndex,
  onSelectTrack,
  hasInteracted,
  onProgress,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const bg = useColorModeValue('white', 'gray.800')
  const accent = useColorModeValue('teal.500', 'teal.300')

  const currentSound = playlist[currentIndex]

  useEffect(() => {
    const audio = audioRef.current!
    audio.load()

    // si utilisateur a interagi, auto-play
    if (hasInteracted) {
      audio.play().catch(() => {})
    }

    const onLoaded = () => {
      setDuration(audio.duration)
      onProgress(0)
    }
    const onTime = () => {
      const p = audio.currentTime / audio.duration
      setCurrentTime(audio.currentTime)
      onProgress(p)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      if (currentIndex < playlist.length - 1) {
        onSelectTrack(currentIndex + 1)
      }
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [currentIndex, hasInteracted])

  const togglePlay = () => {
    const audio = audioRef.current!
    isPlaying ? audio.pause() : audio.play().catch(() => {})
  }

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Box bg={bg} borderRadius="lg" boxShadow="md" p={4} w="100%" mb={4}>
      <Flex align="center" justify="space-between" mb={2}>
        <Flex align="center">
          <IconButton
            aria-label={isPlaying ? 'Pause' : 'Play'}
            icon={isPlaying ? <FiPause /> : <FiPlay />}
            onClick={togglePlay}
            colorScheme="teal"
            size="lg"
            mr={3}
          />
          <Text fontSize="lg" fontWeight="bold" isTruncated maxW="300px">
            {currentSound.title}
          </Text>
        </Flex>
        <Flex>
          <IconButton
            aria-label="Précédent"
            icon={<FiChevronLeft />}
            onClick={() => onSelectTrack(currentIndex - 1)}
            isDisabled={currentIndex === 0}
            mr={2}
          />
          <IconButton
            aria-label="Suivant"
            icon={<FiChevronRight />}
            onClick={() => onSelectTrack(currentIndex + 1)}
            isDisabled={currentIndex === playlist.length - 1}
          />
        </Flex>
      </Flex>

      <Flex align="center" gap={2} mb={2}>
        <Text fontSize="sm" whiteSpace="nowrap">
          {formatTime(currentTime)}
        </Text>
        <Slider
          flex="1"
          value={duration ? (currentTime / duration) * 100 : 0}
          onChange={val => {
            const audio = audioRef.current!
            const seekTime = (val / 100) * duration
            audio.currentTime = seekTime
            setCurrentTime(seekTime)
          }}
          focusThumbOnChange={false}
        >
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg={accent} />
          </SliderTrack>
          <SliderThumb boxSize={4} />
        </Slider>
        <Text fontSize="sm" whiteSpace="nowrap">
          {formatTime(duration)}
        </Text>
      </Flex>

      <audio
        ref={audioRef}
        src={currentSound.url}
        style={{ display: 'none' }}
      />
    </Box>
  )
}
