import { useEffect, useState } from 'react'
import api from '../axiosConfig'
import {
  Box,
  SimpleGrid,
  Text,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiPlay } from 'react-icons/fi'
import AudioPlayer from './AudioPlayer'

interface Track {
  id: number
  title: string
  audio_url: string
}

interface Sound {
  title: string
  url: string
}

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    api
      .get<Track[]>('/tracks/')
      .then(res => setTracks(res.data))
      .catch(() => setTracks([]))
  }, [])

  const playlist: Sound[] = tracks.map(track => ({
    title: track.title,
    url: `http://192.168.1.194:8002/api/audio/${track.audio_url
      .split('/')
      .pop()}`,
  }))

  const cardBg = useColorModeValue('gray.100', 'gray.700')
  const cardHover = useColorModeValue('gray.200', 'gray.600')

  return (
    <Box>
      {playlist.length > 0 && (
        <Box mb={6}>
          <AudioPlayer
            playlist={playlist}
            currentIndex={currentIndex}
            onSelectTrack={idx => {
              setCurrentIndex(idx)
              setHasInteracted(true)
            }}
            hasInteracted={hasInteracted}
          />
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
        {playlist.map((sound, idx) => (
          <Box
            key={idx}
            bg={cardBg}
            _hover={{ bg: cardHover }}
            borderRadius="lg"
            overflow="hidden"
            cursor="pointer"
            onClick={() => {
              setCurrentIndex(idx)
              setHasInteracted(true)
            }}
          >
            <Box p={4} display="flex" alignItems="center">
              <IconButton
                aria-label="Play"
                icon={<FiPlay />}
                size="lg"
                colorScheme="teal"
                mr={3}
              />
              <Text fontWeight="semibold" isTruncated>
                {sound.title}
              </Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {playlist.length === 0 && (
        <Text textAlign="center" py={8}>
          Aucun son disponible
        </Text>
      )}
    </Box>
  )
}
