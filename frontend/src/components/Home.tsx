import { useState } from 'react'
import { Box, Button, Flex, Heading, Spacer, Stack } from '@chakra-ui/react'
import CollectionList from '../components/CollectionList'
import TrackList from '../components/TrackList'

export default function Home() {
  const [viewMode, setViewMode] = useState<'collections' | 'tracks'>('tracks')

  return (
    <Box bg="gray.50" w="100%" minH="100vh">
      {/* Même padding que ta Navbar (px 4/md:8) */}
      <Box px={{ base: 4, md: 8 }} pt={4}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          align="center"
          mb={4}
          spacing={4}
        >
          <Heading size="lg" flex={1}>
            Bibliothèque –{' '}
            {viewMode === 'collections' ? 'Playlists' : 'Tous les sons'}
          </Heading>
          <Spacer />
          <Button
            colorScheme="teal"
            onClick={() =>
              setViewMode(
                viewMode === 'collections' ? 'tracks' : 'collections'
              )
            }
          >
            {viewMode === 'collections'
              ? 'Afficher tous les sons'
              : 'Afficher les playlists'}
          </Button>
        </Stack>

        {viewMode === 'collections' ? (
          <CollectionList />
        ) : (
          <TrackList />
        )}
      </Box>
    </Box>
  )
}
