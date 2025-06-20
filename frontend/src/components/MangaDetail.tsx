import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Container,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Center,
  Divider,
} from '@chakra-ui/react'
import axios from 'axios'
import ChapterList from './ChapterList'
import api from '../axiosConfig'

interface Manga {
  id: number
  title: string
  description: string
  cover_url: string
}

interface Chapter {
  id: number
  number: number
  pages: string[]
}

export default function MangaDetail() {
  const { id } = useParams<{ id: string }>()
  const [manga, setManga] = useState<Manga | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMangaAndChapters = async () => {
      try {
        const [mangaResponse, chaptersResponse] = await Promise.all([
          api.get(`http://192.168.1.194:8001/api/mangas/${id}`),
          api.get(`http://192.168.1.194:8001/api/mangas/${id}/chapters`),
        ])
        setManga(mangaResponse.data)
        setChapters(chaptersResponse.data)
  
        // Clear le flag si nouveau chapitre
        if (mangaResponse.data.has_new_chapter) {
          await api.post(`http://192.168.1.194:8001/api/mangas/${id}/clear-new`)
        }
      } catch (error) {
        setError('Erreur lors du chargement du manga')
        console.error('Error fetching manga:', error)
      } finally {
        setIsLoading(false)
      }
    }
  
    if (id) {
      fetchMangaAndChapters()
    }
  }, [id])

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (error || !manga) {
    return (
      <Center h="50vh">
        <Text color="red.500">{error || 'Manga non trouvé'}</Text>
      </Center>
    )
  }

  return (
    <Container maxW="container.lg" px={4}>
      <Box mb={8}>
        <VStack spacing={6} align="center" textAlign="center">
          <Image
            src={manga.cover_url}
            alt={manga.title}
            maxW="300px"
            objectFit="cover"
            borderRadius="lg"
            fallbackSrc="https://via.placeholder.com/300x400?text=No+Image"
          />
          <Heading size="2xl">{manga.title}</Heading>
          <Text fontSize="lg" color="gray.600">
            {manga.description}
          </Text>
        </VStack>
      </Box>

      <Divider my={8} />

      <Box>
        <Heading size="xl" mb={6} textAlign="center">
          Chapitres
        </Heading>
        <ChapterList chapters={chapters} mangaId={manga.id} />
      </Box>
    </Container>
  )
}
