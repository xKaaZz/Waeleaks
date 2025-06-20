import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Container,
  Image,
  Heading,
  Text,
  VStack,
  Spinner,
  Center,
  Divider,
  List,
  ListItem,
} from '@chakra-ui/react'
import api from '../axiosConfig'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from '@chakra-ui/react'

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
  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/collections/${id}`)
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
    <Container maxW="container.md" px={4}>
      <VStack spacing={6} align="center" textAlign="center">
        <Image
          src={collection.cover_url}
          alt={collection.title}
          maxW="300px"
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
        <Heading size="lg" mb={4}>
          Sons
        </Heading>
        <List spacing={4}>
          {collection.tracks.map((track) => (
            <ListItem key={track.id}>
              <Text fontWeight="bold">{track.title}</Text>
              <audio controls style={{ width: '100%' }}>
                <source src={`http://localhost:8001/${track.audio_url}`} type="audio/mpeg" />
                Votre navigateur ne supporte pas l'audio.
              </audio>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box textAlign="center" mt={8}>
        <RouterLink to={`/collection/${collection.id}/add`}>
          <Button colorScheme="green">Ajouter un son</Button>
        </RouterLink>
      </Box>
    </Container>
  )
}
