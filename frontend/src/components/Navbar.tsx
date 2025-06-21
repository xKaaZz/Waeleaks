import { useState, useEffect } from 'react'
import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import axios from 'axios'
import CollectionCard from './CollectionCard'
import TrackPlayer from './TrackPlayer'

export default function Home() {
  const [viewMode, setViewMode] = useState<'collection' | 'track'>('collection')
  const [collections, setCollections] = useState([])
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    axios.get('http://192.168.1.194:8002/api/collections/').then((res) => setCollections(res.data))
    axios.get('http://192.168.1.194:8002/api/tracks/').then((res) => setTracks(res.data))
  }, [])

  return (
    <Box p={8}>
      <Flex align="center" justify="space-between" mb={6}>
        <Heading size="xl">Bibliothèque de sons</Heading>
        <Button
          colorScheme="blue"
          variant="outline"
          onClick={() =>
            setViewMode((prev) => (prev === 'collection' ? 'track' : 'collection'))
          }
        >
          {viewMode === 'collection' ? 'Afficher par sons' : 'Afficher par collections'}
        </Button>
      </Flex>

      {viewMode === 'collection' ? (
        <Flex wrap="wrap" gap={6}>
          {collections.map((col: any) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </Flex>
      ) : (
        <Flex direction="column" gap={4}>
          {tracks.map((track: any) => (
            <TrackPlayer key={track.id} track={track} />
          ))}
        </Flex>
      )}
    </Box>
  )
}
