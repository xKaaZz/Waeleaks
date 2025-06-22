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
  const currentSound = playlist[currentIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.load()

    // lecture automatique après changement de source
    setTimeout(() => {
      audio
        .play()
        .catch((err) => console.warn('Lecture refusée ou bloquée :', err))
    }, 50)
  }, [currentIndex])

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
          onClick={() => {
            if (currentIndex > 0) onSelectTrack(currentIndex - 1)
          }}
          isDisabled={currentIndex === 0}
        >
          Précédent
        </Button>
        <Button
          onClick={() => {
            if (currentIndex < playlist.length - 1) {
              onSelectTrack(currentIndex + 1)
            }
          }}
          isDisabled={currentIndex === playlist.length - 1}
        >
          Suivant
        </Button>
      </HStack>
    </Box>
  )
}
