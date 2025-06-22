import { useEffect, useState } from 'react'
import api from '../axiosConfig'
import {
  VStack,
  Box,
  Text,
  Heading,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react'
import AudioPlayer from './AudioPlayer'

interface Track {
  id: number
  title: string
  audio_url: string
}

interface Sound {
  title: string
  url: string
}

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    api.get('/tracks/')
      .then(res => setTracks(res.data))
      .catch(() => setTracks([]))
  }, [])

  const playlist: Sound[] = tracks.map(track => ({
    title: track.title,
    url: `http://192.168.1.194:8002/api/audio/${track.audio_url.split('/').pop()}`,
  }))

  const bg = useColorModeValue('gray.100', 'gray.700')

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Bibliothèque – Tous les sons
      </Heading>

      {playlist.length > 0 && (
        <Box mb={6}>
          <AudioPlayer
            playlist={playlist}
            currentIndex={currentIndex}
            onSelectTrack={index => {
              setCurrentIndex(index)
              setHasInteracted(true)
            }}
            hasInteracted={hasInteracted}
          />
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
        {playlist.map((sound, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            bg={bg}
            cursor="pointer"
            _hover={{ bg: 'blue.50' }}
            onClick={() => {
              setCurrentIndex(index)
              setHasInteracted(true)
            }}
          >
            <Text fontWeight="bold">{sound.title}</Text>
            <Text fontSize="sm" color="gray.500">
              Cliquer pour jouer
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {playlist.length === 0 && (
        <Text textAlign="center" py={8}>
          Aucun son disponible
        </Text>
      )}
    </Box>
  )
}
