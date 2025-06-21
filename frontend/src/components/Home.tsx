// ✅ Home.tsx responsive
import { useState } from 'react'
import { Box, Button, Flex, Heading, Spacer, Stack } from '@chakra-ui/react'
import CollectionList from './CollectionList'
import TrackList from './TrackList'

export default function Home() {
  const [viewMode, setViewMode] = useState<'collections' | 'tracks'>('collections')

  return (
    <Box px={{ base: 4, md: 8 }} pb={24}>
      <Stack direction={{ base: 'column', md: 'row' }} align="center" mb={4} spacing={4}>
        <Heading size="lg" flex={1}>
          Bibliothèque – {viewMode === 'collections' ? 'Collections' : 'Tous les sons'}
        </Heading>
        <Spacer />
        <Button
          colorScheme="teal"
          onClick={() => setViewMode(viewMode === 'collections' ? 'tracks' : 'collections')}
        >
          Afficher {viewMode === 'collections' ? 'tous les sons' : 'les collections'}
        </Button>
      </Stack>

      {viewMode === 'collections' ? <CollectionList /> : <TrackList />}
    </Box>
  )
}