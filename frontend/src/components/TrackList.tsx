import { useEffect, useState } from 'react'
import api from '../axiosConfig'
import { Box, Text, VStack, Spinner, Center } from '@chakra-ui/react'

interface Track {
  id: number
  title: string
  audio_url: string
}

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get('/tracks/')
      .then((res) => setTracks(res.data))
      .catch((err) => {
        console.error(err)
        setError('Erreur lors du chargement des sons')
      })
      .finally(() => setIsLoading(false))
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
    <VStack spacing={6} align="stretch" pb={24}> {/* padding bas pour scroll complet */}
      {tracks.map((track) => (
        <Box key={track.id} p={4} borderWidth="1px" borderRadius="md" shadow="sm">
          <Text fontWeight="bold" mb={2}>{track.title}</Text>
          <audio controls style={{ width: '100%' }}>
            <source src={`http://192.168.1.194:8002/${track.audio_url}`} type="audio/mpeg" />
            Votre navigateur ne supporte pas l'audio.
          </audio>
        </Box>
      ))}
    </VStack>
  )
}
