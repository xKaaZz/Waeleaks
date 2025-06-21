import { useEffect, useState } from 'react'
import api from '../axiosConfig'
import { VStack, Box, Text } from '@chakra-ui/react'
import TrackPlayer from './TrackPlayer'

interface Track {
  id: number
  title: string
  audio_url: string
}

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])

  useEffect(() => {
    api
      .get('/tracks/')
      .then(res => setTracks(res.data))
      .catch(() => setTracks([]))
  }, [])

  return (
    <VStack spacing={2} align="stretch" w="100%">
      {tracks.length ? (
        tracks.map(track => (
          <TrackPlayer key={track.id} track={track} />
        ))
      ) : (
        <Text textAlign="center" py={8}>
          Aucun son disponible
        </Text>
      )}
    </VStack>
  )
}
