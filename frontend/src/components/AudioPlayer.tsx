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
  hasInteracted: boolean
}

export default function AudioPlayer({
  playlist,
  currentIndex,
  onSelectTrack,
  hasInteracted,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const currentSound = playlist[currentIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.load()
    // si l'utilisateur a déjà cliqué, on lance la lecture
    if (hasInteracted) {
      setTimeout(() => {
        audio.play().catch(() => {})
      }, 50)
    }
  }, [currentIndex, hasInteracted])

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
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
        <Button
          onClick={() => onSelectTrack(currentIndex - 1)}
          isDisabled={currentIndex === 0}
        >
          Précédent
        </Button>
        <Button
          onClick={() => onSelectTrack(currentIndex + 1)}
          isDisabled={currentIndex === playlist.length - 1}
        >
          Suivant
        </Button>
      </HStack>
    </Box>
  )
}
