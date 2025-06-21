// src/components/Home.tsx
import { useState, useEffect } from 'react'
import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import CollectionList from './CollectionList'
import TrackList from './TrackList' // à créer si pas encore fait

export default function Home() {
  const [viewMode, setViewMode] = useState<'collections' | 'tracks'>('collections')

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">
          Bibliothèque {viewMode === 'collections' ? '– Collections' : '– Tous les sons'}
        </Heading>
        <Button onClick={() => setViewMode(viewMode === 'collections' ? 'tracks' : 'collections')}>
          Afficher {viewMode === 'collections' ? 'tous les sons' : 'les collections'}
        </Button>
      </Flex>

      {viewMode === 'collections' ? <CollectionList /> : <TrackList />}
    </Box>
  )
}
