// src/components/CollectionDetail.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Image,
  Heading,
  Text,
  Divider,
  VStack,
  Spinner,
  Center,
  List,
  ListItem,
  Button,
} from '@chakra-ui/react'
import api from '../axiosConfig'

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
    const fetchData = async () => {
      try {
        const response = await api.get(`/collections/${id}`)
        setCollection(response.data)
      } catch (error) {
        setError('Erreur lors du chargement de la collection')
        console.error('Error fetching collection:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (error || !collection) {
    return (
      <Center h="50vh">
        <Text color="red.500">{error || 'Collection non trouvée'}</Text>
      </Center>
    )
  }

  return (
    <Container maxW={{ base: 'full', md: 'container.md' }} px={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="center" textAlign="center">
        <Image
          src={`http://192.168.1.194:8002/${collection.cover_url}`}
          alt={collection.title}
          maxW={{ base: 'full', sm: '300px' }}
          objectFit="cover"
          borderRadius="lg"
          fallbackSrc="https://via.placeholder.com/300x400?text=No+Image"
        />

        <Heading size="2xl">{collection.title}</Heading>
        <Text fontSize="lg" color="gray.600">
          {collection.description}
        </Text>
      </VStack>

      <Divider my={8} />

      <Box>
        <Heading size="lg" mb={4} textAlign={{ base: 'center', md: 'left' }}>
          Sons
        </Heading>
        <List spacing={6} pb={16}>
          {collection.tracks.map((track) => {
            const filename = track.audio_url.split('/').pop()
            return (
              <ListItem key={track.id} style={{ position: 'relative', zIndex: 0 }}>
                <Text fontWeight="bold" mb={1}>{track.title}</Text>
                <audio
                  controls
                  preload="none"
                  style={{
                    width: '100%',
                    minHeight: '40px',
                    padding: '6px',
                    position: 'relative',
                    zIndex: 1,
                    pointerEvents: 'auto'
                  }}
                >
                  <source src={`http://192.168.1.194:8002/api/audio/${filename}`} type="audio/mpeg" />
                  Votre navigateur ne supporte pas l'audio.
                </audio>
              </ListItem>
            )
          })}
        </List>
      </Box>

      <Box textAlign="center" mt={8}>
        <Button colorScheme="green" onClick={() => navigate(`/collection/${collection.id}/add`)}>
          Ajouter un son
        </Button>
      </Box>
    </Container>
  )
}
