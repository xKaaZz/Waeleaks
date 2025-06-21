import { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Spacer,
  Stack,
} from '@chakra-ui/react'
import Navbar from '../components/Navbar'
import CollectionList from '../components/CollectionList'
import TrackList from '../components/TrackList'

export default function Home() {
  const [viewMode, setViewMode] = useState<'collections' | 'tracks'>('tracks')

  return (
    <Box bg="gray.50" minH="100vh" w="100%">
      {/* Navbar full-width avec px={4} */}
      <Navbar />

      {/* Contenu : même px={4} que la navbar */}
      <Box px={{ base: 4, md: 8 }} pt={4}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          align="center"
          mb={4}
          spacing={4}
        >
          <Heading size="lg" flex={1}>
            Bibliothèque –{' '}
            {viewMode === 'collections' ? 'Collections' : 'Tous les sons'}
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
              : 'Afficher les collections'}
          </Button>
        </Stack>

        {/* Ici tes cards sont full-width dans la zone px={4} */}
        {viewMode === 'collections' ? (
          <CollectionList />
        ) : (
          <TrackList />
        )}
      </Box>
    </Box>
  )
}
