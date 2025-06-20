import { useEffect, useState } from 'react'
import { SimpleGrid, Box, Heading, Text, Center, Spinner } from '@chakra-ui/react'
import axios from 'axios'
import MangaCard from './MangaCard'
import api from '../axiosConfig'

interface Manga {
  id: number
  title: string
  description: string
  cover_url: string
}

export default function MangaList() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const response = await api.get('http://192.168.1.194:8001/api/mangas/')
        setMangas(response.data)
      } catch (error) {
        setError('Erreur lors du chargement des mangas')
        console.error('Error fetching mangas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMangas()
  }, [])

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (error) {
    return (
      <Center h="50vh">
        <Text color="red.500">{error}</Text>
      </Center>
    )
  }

  if (mangas.length === 0) {
    return (
      <Center h="50vh" flexDirection="column" gap={4}>
        <Heading size="lg">Aucun manga</Heading>
        <Text>Commencez par ajouter un manga à votre bibliothèque</Text>
      </Center>
    )
  }

  return (
    <Box>
      <Heading mb={6}>Ma bibliothèque</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {mangas.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </SimpleGrid>
    </Box>
  )
} 