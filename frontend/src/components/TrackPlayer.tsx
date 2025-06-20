import { Box, Text } from '@chakra-ui/react'

interface Track {
  id: number
  title: string
  audio_url: string
}

interface TrackPlayerProps {
  track: Track
}

export default function TrackPlayer({ track }: TrackPlayerProps) {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" shadow="md">
      <Text fontWeight="bold" mb={2}>
        {track.title}
      </Text>
      <audio controls style={{ width: '100%' }}>
        <source src={`http://localhost:8001/${track.audio_url}`} type="audio/mpeg" />
        Votre navigateur ne supporte pas la lecture audio.
      </audio>
    </Box>
  )
}
