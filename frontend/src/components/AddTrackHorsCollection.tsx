import { Box, Button, FormControl, FormLabel, Input, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import api from '../axiosConfig'

export default function AddTrackHorsCollection() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const toast = useToast()

  const handleSubmit = async () => {
    if (!title || !file) {
      toast({ title: 'Champs requis manquants', status: 'warning' })
      return
    }
    const fd = new FormData()
    fd.append('title', title)
    fd.append('audio', file)

    try {
      await api.post('/tracks/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast({ title: 'Son ajouté hors collection', status: 'success' })
      setTitle('')
      setFile(null)
    } catch {
      toast({ title: 'Erreur à l’ajout', status: 'error' })
    }
  }

  return (
    <Box maxW="lg" mx="auto" mt={8}>
      <FormControl mb={4}>
        <FormLabel>Titre du son</FormLabel>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Titre…"
        />
      </FormControl>

      <FormControl mb={6}>
        <FormLabel>Fichier audio</FormLabel>
        <Input
          type="file"
          accept="audio/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
      </FormControl>

      <Button colorScheme="green" onClick={handleSubmit}>
        Ajouter le son
      </Button>
    </Box>
  )
}
