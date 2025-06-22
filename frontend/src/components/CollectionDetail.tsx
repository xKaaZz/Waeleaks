// src/components/CollectionDetail.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Image,
  Heading,
  Text,
  VStack,
  Spinner,
  Center,
  Button,
  HStack,
  IconButton,
  List,
  ListItem,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiPlay, FiPause } from 'react-icons/fi'
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
  tracks?: Track[]
}

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    api
      .get<Collection>(`/collections/${id}`)
      .then(res => setCollection(res.data))
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setIsLoading(false))
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
        <Text color="red.500">{error || 'Collection introuvable'}</Text>
      </Center>
    )
  }

  // Prépare le playlist pour l'AudioPlayer
  const playlist = (collection.tracks || []).map(track => ({
    title: track.title,
    url: `http://192.168.1.194:8002/api/audio/${track.audio_url.split('/').pop()}`,
  }))

  // Thèmes
  const headerBg = useColorModeValue('gray.100', 'gray.700')
  const trackHover = useColorModeValue('gray.200', 'gray.600')
  const currentBg = useColorModeValue('teal.50', 'teal.900')
  const accent = useColorModeValue('teal.500', 'teal.300')

  return (
    <Box bg="gray.50" w="100%" minH="100vh" py={6} px={{ base: 4, md: 8 }}>
      {/* Album Header */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        bg={headerBg}
        p={6}
        borderRadius="lg"
        mb={8}
      >
        <Image
          src={`http://192.168.1.194:8002/${collection.cover_url}`}
          alt={collection.title}
          boxSize={{ base: '200px', md: '250px' }}
          objectFit="cover"
          borderRadius="md"
          mr={{ md: 6 }}
          mb={{ base: 4, md: 0 }}
        />
        <VStack align="start" spacing={3} flex="1">
          <Heading size="2xl">{collection.title}</Heading>
          <Text fontSize="md" color="gray.600">
            {collection.description}
          </Text>
          <HStack spacing={3} mt={4}>
            <Button
              leftIcon={hasInteracted ? <FiPause /> : <FiPlay />}
              colorScheme="teal"
              size="lg"
              onClick={() => {
                setHasInteracted(true)
                if (!hasInteracted) setCurrentIndex(0)
              }}
            >
              {hasInteracted ? 'Pause' : 'Play Album'}
            </Button>
            <Button
              onClick={() => navigate(`/collection/${collection.id}/add`)}
              variant="outline"
            >
              Ajouter un son
            </Button>
          </HStack>
        </VStack>
      </Flex>

      {/* Audio Player : uniquement si on a au moins un son */}
      {playlist.length > 0 && (
        <Box mb={8}>
          <AudioPlayer
            playlist={playlist}
            currentIndex={currentIndex}
            onSelectTrack={idx => {
              setCurrentIndex(idx)
              setHasInteracted(true)
            }}
            hasInteracted={hasInteracted}
            onProgress={setProgress}
          />
        </Box>
      )}

      {/* Track List */}
      <Heading size="lg" mb={4}>
        Liste des morceaux
      </Heading>

      {playlist.length === 0 ? (
        <Center py={16}>
          <Text color="gray.500" fontStyle="italic">
            Aucun son dans cette collection.
          </Text>
        </Center>
      ) : (
        <List spacing={2}>
          {playlist.map((sound, idx) => {
            const isCurrent = idx === currentIndex
            return (
              <ListItem
                as="div"
                key={idx}
                position="relative"
                bg={isCurrent ? currentBg : headerBg}
                borderLeftWidth={isCurrent ? '4px' : 0}
                borderLeftColor={isCurrent ? accent : 'transparent'}
                borderRadius="md"
                _hover={{ bg: isCurrent ? currentBg : trackHover }}
                p={3}
                cursor="pointer"
                onClick={() => {
                  setCurrentIndex(idx)
                  setHasInteracted(true)
                }}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={4}>
                    <Text fontWeight="bold" w="24px" textAlign="right">
                      {idx + 1}.
                    </Text>
                    <Text fontWeight={isCurrent ? 'semibold' : 'normal'}>
                      {sound.title}
                    </Text>
                  </HStack>
                  <IconButton
                    aria-label={isCurrent ? 'Pause' : 'Play'}
                    icon={
                      isCurrent ? <FiPause color={accent} /> : <FiPlay color={accent} />
                    }
                    size="sm"
                    variant="ghost"
                  />
                </Flex>

                {isCurrent && (
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    height="3px"
                    width={`${progress * 100}%`}
                    bg={accent}
                    borderBottomLeftRadius="md"
                  />
                )}
              </ListItem>
            )
          })}
        </List>
      )}
    </Box>
  )
}
