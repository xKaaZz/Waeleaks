import { Box, Heading, VStack, Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function AdminPanel() {
  const navigate = useNavigate()

  return (
    <Box maxW="container.md" mx="auto" mt={8}>
      <Heading mb={6}>Panneau d'administration</Heading>
      <VStack spacing={4}>
        <Button onClick={() => navigate('/add-collection')} colorScheme="blue" width="full">
          Ajouter une collection
        </Button>
        <Button onClick={() => navigate('/add-track')} colorScheme="blue" width="full">
          Ajouter un son
        </Button>
        <Button onClick={() => navigate('/collection/1/add')} colorScheme="blue" width="full">
          Ajouter un son dans une collection
        </Button>

        <Button onClick={() => navigate('/delete-track')} colorScheme="red" variant="outline" width="full">
          Supprimer un son
        </Button>
        <Button onClick={() => navigate('/delete-track-from-collection')} colorScheme="red" variant="outline" width="full">
          Supprimer un son d'une collection
        </Button>
        <Button onClick={() => navigate('/delete-collection')} colorScheme="red" variant="outline" width="full">
          Supprimer une collection
        </Button>
      </VStack>
    </Box>
  )
}
