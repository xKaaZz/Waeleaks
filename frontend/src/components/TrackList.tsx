import { useEffect, useState } from 'react'
import api from '../axiosConfig'
import { Box, Text, VStack } from '@chakra-ui/react'

interface Track {
  id: number
  title: string
  audio_url: string
}

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])

  useEffect(() => {
    api.get('/tracks/')
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]))
  }, [])

  return (
    <Box
      maxH="70vh"          // Limite visible
      overflowY="auto"     // Active le scroll
      pr={2}               // Ajoute du padding à droite pour que la scrollbar ne masque rien
    >
      <VStack spacing={6} align="stretch">
        {tracks.length ? (
          tracks.map((track) => (
            <Box key={track.id} p={4} bg="white" boxShadow="sm" borderRadius="md">
              <Text fontWeight="bold" mb={2}>{track.title}</Text>
              <audio controls style={{ width: '100%' }}>
                <source src={`http://192.168.1.194:8002/${track.audio_url}`} type="audio/mpeg" />
                Votre navigateur ne supporte pas l'audio.
              </audio>
            </Box>
          ))
        ) : (
          <Text>Aucun son disponible</Text>
        )}
      </VStack>
    </Box>
  )
}
