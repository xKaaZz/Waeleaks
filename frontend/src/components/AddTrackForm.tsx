import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../axiosConfig'

export default function AddTrackForm() {
  const { id } = useParams<{ id: string }>()
  const [title, setTitle] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile || !id) return

    const formData = new FormData()
    formData.append('title', title)
    formData.append('audio', audioFile)

    try {
      setIsLoading(true)
      await api.post(`/api/collections/${id}/tracks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast({
        title: 'Son ajouté',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      setTitle('')
      setAudioFile(null)
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le son',
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
            <FormLabel>Titre du son</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Fichier audio</FormLabel>
            <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
          </FormControl>

          <Button type="submit" colorScheme="green" isLoading={isLoading} width="full">
            Ajouter le son
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
