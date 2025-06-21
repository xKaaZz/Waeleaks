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
      maxH="70vh"
      overflowY="auto"
      pr={2}
    >
      <VStack spacing={6} align="stretch">
        {tracks.length ? (
          tracks.map((track) => (
            <Box
              key={track.id}
              p={4}
              bg="white"
              boxShadow="sm"
              borderRadius="md"
              position="relative"
              zIndex={0}
            >
              <Text fontWeight="bold" mb={2}>{track.title}</Text>
              <audio
                controls
                preload="none"
                style={{
                  width: '100%',
                  minHeight: '40px',
                  padding: '6px',
                  position: 'relative',
                  zIndex: 1,
                  pointerEvents: 'auto'
                }}
              >
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
