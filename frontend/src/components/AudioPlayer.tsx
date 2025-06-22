import { useEffect, useRef } from 'react'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

interface Sound {
  title: string
  url: string
}

interface AudioPlayerProps {
  playlist: Sound[]
  currentIndex: number
  onSelectTrack: (index: number) => void
}

export default function AudioPlayer({
  playlist,
  currentIndex,
  onSelectTrack,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playOnLoadRef = useRef(false)

  const currentSound = playlist[currentIndex]

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.load()

    if (playOnLoadRef.current) {
      const tryPlay = () => {
        audioRef.current?.play().catch(() => {
          // Retry after slight delay if autoplay fails
          setTimeout(() => {
            audioRef.current?.play().catch(() => {})
          }, 100)
        })
      }

      // petit délai pour que le DOM reflète la nouvelle source
      setTimeout(tryPlay, 50)
      playOnLoadRef.current = false
    }
  }, [currentIndex])

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      playOnLoadRef.current = true
      onSelectTrack(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      playOnLoadRef.current = true
      onSelectTrack(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      playOnLoadRef.current = true
      onSelectTrack(currentIndex + 1)
    }
  }

  return (
    <Box borderWidth="1px" p={4} borderRadius="md" bg="white" w="100%">
      <Text fontWeight="bold" mb={2}>
        Lecture : {currentSound.title}
      </Text>
      <audio
        ref={audioRef}
        src={currentSound.url}
        controls
        onEnded={handleEnded}
      />
      <HStack mt={2}>
        <Button onClick={handlePrevious} isDisabled={currentIndex === 0}>
          Précédent
        </Button>
        <Button onClick={handleNext} isDisabled={currentIndex === playlist.length - 1}>
          Suivant
        </Button>
      </HStack>
    </Box>
  )
}
