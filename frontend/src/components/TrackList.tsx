// src/components/TrackList.tsx
import { useEffect, useState } from 'react'
import api from '../axiosConfig'
import { SimpleGrid, Text } from '@chakra-ui/react'
import TrackPlayer from './TrackPlayer'

interface Track {
  id: number
  title: string
  audio_url: string
}

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])

  useEffect(() => {
    api.get('/tracks/') // ⚠️ il faut que cette route existe côté backend
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]))
  }, [])

  return (
    <SimpleGrid spacing={4} columns={[1, 2, 3]}>
      {tracks.length ? (
        tracks.map((track) => <TrackPlayer key={track.id} track={track} />)
      ) : (
        <Text>Aucun son disponible</Text>
      )}
    </SimpleGrid>
  )
}
