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
  tracks: Track[]
}

export default function CollectionDetail() {
  // Hooks always at top
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [progress, setProgress] = useState(0) // from 0 to 1

  // theme values
  const headerBg   = useColorModeValue('gray.100', 'gray.700')
  const trackHover = useColorModeValue('gray.200', 'gray.600')
  const currentBg  = useColorModeValue('teal.50', 'teal.900')
  const accent     = useColorModeValue('teal.500', 'teal.300')

  useEffect(() => {
    api
      .get<Collection>(`/collections/${id}`)
      .then(res => setCollection(res.data))
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setIsLoading(false))
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
        <Text color="red.500">{error}</Text>
      </Center>
    )

  // build playlist
  const playlist = collection.tracks.map(track => ({
    title: track.title,
    url: `http://192.168.1.194:8002/api/audio/${track.audio_url.split('/').pop()}`,
  }))

  return (
    <Box bg="gray.50" w="100%" minH="100vh" py={6} px={{ base: 4, md: 8 }}>
      {/* Album header */}
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

      {/* Global audio player */}
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

      {/* Track list with top & bottom progress bars */}
      <Heading size="lg" mb={4}>
        Liste des morceaux
      </Heading>
      <List spacing={2}>
        {playlist.map((sound, idx) => {
          const isCurrent = idx === currentIndex
          const isComplete = isCurrent && progress >= 0.99
          return (
            <ListItem
              as="div"
              key={idx}
              position="relative"
              bg={isCurrent ? currentBg : headerBg}
              borderLeftWidth={isCurrent ? '4px' : 0}
              borderLeftColor={isCurrent ? accent : 'transparent'}
              borderTopWidth={isComplete ? '4px' : 0}
              borderRightWidth={isComplete ? '4px' : 0}
              borderBottomWidth={isComplete ? '4px' : 0}
              borderColor={accent}
              borderRadius="md"
              _hover={{ bg: isCurrent ? currentBg : trackHover }}
              p={3}
              cursor="pointer"
              onClick={() => {
                setCurrentIndex(idx)
                setHasInteracted(true)
              }}
            >
              {/* top progress bar */}
              {isCurrent && (
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  height="3px"
                  width={`${progress * 100}%`}
                  bg={accent}
                  borderTopLeftRadius="md"
                />
              )}

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
                    isCurrent ? (
                      <FiPause color={accent} />
                    ) : (
                      <FiPlay color={accent} />
                    )
                  }
                  size="sm"
                  variant="ghost"
                />
              </Flex>

              {/* bottom progress bar */}
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
    </Box>
  )
}
