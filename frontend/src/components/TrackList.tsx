import { useEffect, useState } from 'react'
import api from '../axiosConfig'
import { Box, Text, VStack, Container } from '@chakra-ui/react'

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
    <Container maxW="container.sm" px={{ base: 4, md: 6 }} py={4}>
      <VStack spacing={4} align="stretch">
        {tracks.length ? (
          tracks.map((track) => {
            const filename = track.audio_url.split('/').pop()
            return (
              <Box
                key={track.id}
                p={3}
                bg="white"
                boxShadow="base"
                borderRadius="md"
              >
                <Text fontWeight="semibold" fontSize="md" mb={1} noOfLines={1}>
                  {track.title}
                </Text>
                <audio
                  controls
                  preload="none"
                  style={{
                    width: '100%',
                    minHeight: '38px',
                  }}
                >
                  <source src={`http://192.168.1.194:8002/api/audio/${filename}`} type="audio/mpeg" />
                  Votre navigateur ne supporte pas l'audio.
                </audio>
              </Box>
            )
          })
        ) : (
          <Text>Aucun son disponible</Text>
        )}
      </VStack>
    </Container>
  )
}
