import { Box, Image, Heading, Text, Badge } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import api from '../axiosConfig'

interface Manga {
  id: number
  title: string
  description: string
  cover_url: string
  has_new_chapter?: boolean
}

interface MangaCardProps {
  manga: Manga
}

export default function MangaCard({ manga }: MangaCardProps) {
  return (
    <RouterLink to={`/manga/${manga.id}`}>
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
          src={manga.cover_url}
          alt={manga.title}
          w="100%"
          h="300px"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/300x400?text=No+Image"
        />

        {manga.has_new_chapter && (
          <Badge
            colorScheme="green"
            position="absolute"
            top={2}
            right={2}
            zIndex={1}
          >
            Nouveau chapitre
          </Badge>
        )}

        <Box p={4}>
          <Heading size="md" noOfLines={1}>
            {manga.title}
          </Heading>
          <Text noOfLines={2} color="gray.600" mt={2}>
            {manga.description}
          </Text>
        </Box>
      </Box>
    </RouterLink>
  )
}
