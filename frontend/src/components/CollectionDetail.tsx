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
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react'
import api from '../axiosConfig'
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
  const [currentIndex, setCurrentIndex] = useState(0)

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

  const playlist = collection.tracks.map(track => ({
    title: track.title,
    url: `http://192.168.1.194:8002/api/audio/${track.audio_url.replace('uploads/audio/', '')}`,
  }))

  const bg = useColorModeValue('gray.100', 'gray.700')

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
            fallbackSrc="/no-image.png"
          />
          <Heading size={{ base: 'lg', md: '2xl' }}>
            {collection.title}
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
            {collection.description}
          </Text>
        </VStack>

        <Divider my={6} />

        {playlist.length > 0 && (
          <>
            <Heading size="lg" mb={4}>
              🎧 Lecture automatique
            </Heading>
            <AudioPlayer
              playlist={playlist}
              currentIndex={currentIndex}
              onSelectTrack={setCurrentIndex}
            />

            <Divider my={8} />

            <Heading size="lg" mb={4}>
              Sons
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              {playlist.map((sound, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg={bg}
                  cursor="pointer"
                  _hover={{ bg: 'blue.50' }}
                  onClick={() => setCurrentIndex(index)}
                >
                  <Text fontWeight="bold">{sound.title}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Cliquer pour jouer
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </>
        )}

        <Box textAlign="center" mt={8}>
          <Button
            colorScheme="green"
            onClick={() => navigate(`/collection/${collection.id}/add`)}
          >
            Ajouter un son
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
