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
  const [durations, setDurations] = useState<Record<number, number>>({})

  useEffect(() => {
    api.get<Track[]>('/tracks/')
      .then(res => setTracks(res.data))
      .catch(() => setTracks([]))
  }, [])

  // Pré-charger les durées
  useEffect(() => {
    tracks.forEach(track => {
      const url = `http://192.168.1.194:8002/api/audio/${track.audio_url.split('/').pop()}`
      const audio = new Audio(url)
      audio.preload = 'metadata'
      audio.addEventListener('loadedmetadata', () => {
        setDurations(d => ({ ...d, [track.id]: audio.duration }))
      })
    })
  }, [tracks])

  const playlist: Sound[] = tracks.map(track => ({
    title: track.title,
    url: `http://192.168.1.194:8002/api/audio/${track.audio_url.split('/').pop()}`,
  }))

  const cardBg = useColorModeValue('gray.100', 'gray.700')
  const cardHover = useColorModeValue('gray.200', 'gray.600')

  const formatTime = (t = 0) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

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
        {tracks.map((track, idx) => (
          <Box
            key={track.id}
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
            <Box p={4} display="flex" alignItems="center" justifyContent="space-between">
              <IconButton
                aria-label="Play"
                icon={<FiPlay />}
                size="lg"
                colorScheme="teal"
                mr={3}
              />
              <Text flex="1" fontWeight="semibold" isTruncated>
                {track.title}
              </Text>
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap" ml={3}>
                {formatTime(durations[track.id])}
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
