// AddStandaloneTrack.tsx
import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react'
import api from '../axiosConfig'

export default function AddStandaloneTrack() {
  const [title, setTitle] = useState('')
  const [audio, setAudio] = useState<File | null>(null)
  const toast = useToast()

  const handleSubmit = async () => {
    if (!title || !audio) {
      toast({ title: 'Champs requis manquants', status: 'error' })
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('audio', audio)

    try {
      await api.post('/tracks/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast({ title: 'Son ajouté', status: 'success' })
      setTitle('')
      setAudio(null)
    } catch (err) {
      toast({ title: 'Erreur lors de l’upload', status: 'error' })
    }
  }

  return (
    <Box maxW="600px" mx="auto" mt={10}>
      <Heading mb={6}>Ajouter un son</Heading>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Titre du son</FormLabel>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Fichier audio</FormLabel>
          <Input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0] || null)} />
        </FormControl>
        <Button colorScheme="green" onClick={handleSubmit}>
          Ajouter le son
        </Button>
      </VStack>
    </Box>
  )
}
