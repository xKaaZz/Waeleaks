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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load() // prépare la source
    }
  }, [currentIndex])

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1)
      // Important : attendre que load soit terminé
      setTimeout(() => {
        audioRef.current?.play().catch((err) => {
          console.warn('Lecture bloquée :', err)
        })
      }, 100) // petit délai pour laisser le navigateur charger
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
          onClick={() => {
            if (currentIndex < playlist.length - 1) {
              setCurrentIndex(currentIndex + 1)
              setTimeout(() => {
                audioRef.current?.play().catch(() => {})
              }, 100)
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
