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
  const filename = track.audio_url.split('/').pop()

  return (
    <Box
      w="100%"              // plein écran dans la zone px={4/md:8} de Home
      bg="white"
      boxShadow="sm"
      borderRadius="md"
      p={{ base: 3, md: 4 }}
    >
      <Text fontWeight="semibold" mb={2} noOfLines={1}>
        {track.title}
      </Text>
      <audio
        controls
        preload="none"
        style={{
          width: '100%',     // occupe tout l’espace
          minHeight: '40px',
        }}
      >
        <source
          src={`http://192.168.1.194:8002/api/audio/${filename}`}
          type="audio/mpeg"
        />
        Votre navigateur ne supporte pas la lecture audio.
      </audio>
    </Box>
  )
}
