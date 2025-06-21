import { Box, Image, Heading, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

interface Collection {
  id: number
  title: string
  description: string
  cover_url: string
}

interface Props {
  collection: Collection
}

export default function CollectionCard({ collection }: Props) {
  return (
    <RouterLink to={`/collection/${collection.id}`}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        transition="transform 0.2s"
        _hover={{ transform: 'scale(1.02)' }}
        bg="white"
        h="100%"
        position="relative"
      >
        <Image
          src={`http://192.168.1.194:8002/${collection.cover_url}`}
          alt={collection.title}
          w="100%"
          h="300px"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/300x400?text=No+Image"
        />

        <Box p={4}>
          <Heading size="md" noOfLines={1}>
            {collection.title}
          </Heading>
          <Text noOfLines={2} color="gray.600" mt={2}>
            {collection.description}
          </Text>
        </Box>
      </Box>
    </RouterLink>
  )
}
