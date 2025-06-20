import { useEffect, useState } from 'react'
import { SimpleGrid, Box, Heading, Text, Center, Spinner } from '@chakra-ui/react'
import CollectionCard from './CollectionCard'
import api from '../axiosConfig'

interface Collection {
  id: number
  title: string
  description: string
  cover_url: string
}

export default function CollectionList() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await api.get('/collections/')
        setCollections(response.data)
      } catch (error) {
        setError('Erreur lors du chargement des collections')
        console.error('Error fetching collections:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollections()
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

  if (collections.length === 0) {
    return (
      <Center h="50vh" flexDirection="column" gap={4}>
        <Heading size="lg">Aucune collection</Heading>
        <Text>Ajoutez votre première mixtape ou album</Text>
      </Center>
    )
  }

  return (
    <Box>
      <Heading mb={6}>Bibliothèque de sons</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </SimpleGrid>
    </Box>
  )
}
