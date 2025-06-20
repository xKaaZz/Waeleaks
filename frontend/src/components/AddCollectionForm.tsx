import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig'

export default function AddCollectionForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    if (coverFile) {
      formData.append('cover', coverFile)
    }

    try {
      const response = await api.post('/api/collections/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast({
        title: 'Collection créée',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate(`/collection/${response.data.id}`)
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la collection',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Titre</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>Image de couverture</FormLabel>
            <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          </FormControl>

          <Button type="submit" colorScheme="blue" isLoading={isLoading} width="full">
            Créer la collection
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
