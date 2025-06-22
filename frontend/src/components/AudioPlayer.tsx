import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Flex,
  IconButton,
  Text,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiPlay, FiPause, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface Sound {
  title: string
  url: string
}

interface AudioPlayerProps {
  playlist: Sound[]
  currentIndex: number
  onSelectTrack: (index: number) => void
  hasInteracted: boolean
}

export default function AudioPlayer({
  playlist,
  currentIndex,
  onSelectTrack,
  hasInteracted,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const bg = useColorModeValue('white', 'gray.800')

  const currentSound = playlist[currentIndex]

  useEffect(() => {
    const audio = audioRef.current!
    audio.load()

    if (hasInteracted) {
      audio.play().catch(() => {})
    }

    const update = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration)
    }
    audio.addEventListener('timeupdate', update)
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', update)
    }
  }, [currentIndex, hasInteracted])

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      onSelectTrack(currentIndex + 1)
    }
  }

  const togglePlay = () => {
    const audio = audioRef.current!
    isPlaying ? audio.pause() : audio.play().catch(() => {})
  }

  return (
    <Box bg={bg} borderRadius="lg" boxShadow="md" p={4} w="100%">
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

      <Progress
        value={progress * 100}
        size="sm"
        colorScheme="teal"
        mb={2}
        borderRadius="sm"
      />

      <audio
        ref={audioRef}
        src={currentSound.url}
        onEnded={handleEnded}
        style={{ display: 'none' }}
      />
    </Box>
  )
}
