import { useEffect, useRef, useState } from 'react'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

interface Sound {
  title: string
  url: string
}

interface AudioPlayerProps {
  playlist: Sound[]
}

export default function AudioPlayer({ playlist }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentSound = playlist[currentIndex]

  // On ne tente plus play() automatiquement (bloqué par le navigateur)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load()
    }
  }, [currentIndex])

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1)
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
          onClick={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
          isDisabled={currentIndex === 0}
        >
          Précédent
        </Button>
        <Button
          onClick={() => setCurrentIndex(Math.min(currentIndex + 1, playlist.length - 1))}
          isDisabled={currentIndex === playlist.length - 1}
        >
          Suivant
        </Button>
      </HStack>
    </Box>
  )
}
