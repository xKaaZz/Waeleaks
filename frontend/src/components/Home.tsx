import { useEffect, useState } from 'react'
import { SimpleGrid, Box, Heading, Text, Center, Spinner, VStack, HStack } from '@chakra-ui/react'
import api from '../axiosConfig'

interface Track {
  id: number
  title: string
  audio_url: string
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await api.get('/tracks/')
        setTracks(response.data)
      } catch (error) {
        setError("Erreur lors du chargement des sons")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTracks()
  }, [])

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (error) {
    return (
      <Center h="50vh">
        <Text color="red.500">{error}</Text>
      </Center>
    )
  }

  if (tracks.length === 0) {
    return (
      <Center h="50vh">
        <Text>Aucun son disponible</Text>
      </Center>
    )
  }

  return (
    <Box>
      <Heading size="xl" mb={6}>Bibliothèque – Tous les sons</Heading>
      <VStack spacing={6} align="stretch">
        {tracks.map((track) => (
          <Box key={track.id} p={4} borderWidth="1px" borderRadius="md" boxShadow="md" bg="white">
            <Heading size="md" mb={2}>{track.title}</Heading>
            <audio controls style={{ width: '100%' }}>
              <source src={`http://192.168.1.194:8002/${track.audio_url}`} type="audio/mpeg" />
              Votre navigateur ne supporte pas l'audio.
            </audio>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}
