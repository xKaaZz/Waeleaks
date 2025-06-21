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
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="white"
      shadow="md"
      width="100%"
      position="relative"
      zIndex={0}
    >
      <Text fontWeight="bold" mb={2}>
        {track.title}
      </Text>
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
        <source src={`http://192.168.1.194:8002/uploads/audio/${track.audio_url.split("/").pop()}`} type="audio/mpeg" />
        Votre navigateur ne supporte pas la lecture audio.
      </audio>
    </Box>
  )
}
