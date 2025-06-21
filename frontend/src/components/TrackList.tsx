// src/components/TrackList.tsx
import { useEffect, useState } from 'react'
import api from '../axiosConfig'
import { VStack, Box, Text } from '@chakra-ui/react'

interface Track {
  id: number
  title: string
  audio_url: string
}

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])

  useEffect(() => {
    api.get('/tracks/')
      .then(res => setTracks(res.data))
      .catch(() => setTracks([]))
  }, [])

  return (
    <VStack spacing={2} align="stretch" w="100%">
      {tracks.length ? (
        tracks.map(track => {
          const filename = track.audio_url.split('/').pop()
          return (
            <Box
              key={track.id}
              w="100%"                // occupe 100% de la zone px={4} de la page
              bg="white"
              boxShadow="sm"
              borderRadius="md"
              p={3}
            >
              <Text fontSize="md" fontWeight="semibold" mb={2} noOfLines={1}>
                {track.title}
              </Text>
              <audio
                controls
                preload="none"
                style={{
                  width: '100%',       // prend toute la largeur du Box
                  minHeight: '40px',
                }}
              >
                <source
                  src={`http://192.168.1.194:8002/api/audio/${filename}`}
                  type="audio/mpeg"
                />
                Votre navigateur ne supporte pas l'audio.
              </audio>
            </Box>
          )
        })
      ) : (
        <Text textAlign="center" py={8}>
          Aucun son disponible
        </Text>
      )}
    </VStack>
  )
}
