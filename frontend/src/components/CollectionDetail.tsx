import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Image,
  Heading,
  Text,
  Divider,
  VStack,
  Spinner,
  Center,
  Button,
} from '@chakra-ui/react'
import api from '../axiosConfig'
import TrackPlayer from './TrackPlayer'
import AudioPlayer from './AudioPlayer'

interface Track {
  id: number
  title: string
  audio_url: string
}

interface Collection {
  id: number
  title: string
  description: string
  cover_url: string
  tracks: Track[]
}

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/collections/${id}`)
        setCollection(res.data)
      } catch {
        setError('Erreur de chargement')
      } finally {
        setIsLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  if (isLoading)
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  if (error || !collection)
    return (
      <Center h="50vh">
        <Text color="red.500">{error || 'Collection non trouvée'}</Text>
      </Center>
    )

  return (
    <Box bg="gray.50" w="100%" minH="100vh">
      <Box px={{ base: 4, md: 8 }} py={4}>
        <VStack spacing={6} align="center" textAlign="center">
          <Image
            src={`http://192.168.1.194:8002/${collection.cover_url}`}
            alt={collection.title}
            w={{ base: '100%', sm: '80%', md: '300px' }}
            objectFit="cover"
            borderRadius="lg"
            fallbackSrc="https://via.placeholder.com/300x400?text=No+Image"
          />
          <Heading size={{ base: 'lg', md: '2xl' }}>
            {collection.title}
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
            {collection.description}
          </Text>
        </VStack>

        <Divider my={6} />

        <Box>
          <Heading size="lg" mb={4}>
            Sons
          </Heading>
          <VStack spacing={2} align="stretch">
            {collection.tracks.map(track => (
              <TrackPlayer key={track.id} track={track} />
            ))}
          </VStack>
        </Box>

        <Box textAlign="center" mt={6}>
          <Button
            colorScheme="green"
            onClick={() => navigate(`/collection/${collection.id}/add`)}
          >
            Ajouter un son
          </Button>
        </Box>

        {collection.tracks.length > 0 && (
          <>
            <Divider my={8} />
            <Heading size="md" mb={4} textAlign="center">
              🎧 Lecture automatique
            </Heading>
            <AudioPlayer
              playlist={collection.tracks.map(track => ({
                title: track.title,
                url: `http://192.168.1.194:8002/api/audio/${track.audio_url.replace('uploads/audio/', '')}`,
              }))}
            />
          </>
        )}
      </Box>
    </Box>
  )
}
