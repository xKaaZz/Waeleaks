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
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" shadow="md" width="100%">
      <Text fontWeight="bold" mb={2}>
        {track.title}
      </Text>
      <audio
        controls
        preload="auto"
        style={{
          width: '100%',
          cursor: 'pointer',
        }}
      >
        <source
          src={`http://192.168.1.194:8002/${track.audio_url}`}
          type="audio/mpeg"
        />
        Votre navigateur ne supporte pas la lecture audio.
      </audio>
    </Box>
  )
}
