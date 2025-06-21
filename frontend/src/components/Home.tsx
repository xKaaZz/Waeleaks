// src/components/Home.tsx
import { useState } from 'react'
import { Box, Button, Flex, Heading, Spacer } from '@chakra-ui/react'
import CollectionList from './CollectionList'
import TrackList from './TrackList'

export default function Home() {
  const [viewMode, setViewMode] = useState<'collections' | 'tracks'>('collections')

  return (
    <Box>
      <Flex align="center" mb={4}>
        <Heading size="lg">
          Bibliothèque – {viewMode === 'collections' ? 'Collections' : 'Tous les sons'}
        </Heading>
        <Spacer />
        <Button colorScheme="teal" onClick={() => setViewMode(viewMode === 'collections' ? 'tracks' : 'collections')}>
          Afficher {viewMode === 'collections' ? 'tous les sons' : 'les collections'}
        </Button>
      </Flex>

      {viewMode === 'collections' ? <CollectionList /> : <TrackList />}
    </Box>
  )
}
