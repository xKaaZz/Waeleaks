import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import api from '../axiosConfig'

export default function AddTrackToCollection() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [collections, setCollections] = useState<{ id: number; title: string }[]>([])
  const [colId, setColId] = useState<string>('')
  const toast = useToast()

  useEffect(() => {
    api.get('/collections/').then(res => setCollections(res.data))
  }, [])

  const handleSubmit = async () => {
    if (!title || !file || !colId) {
      toast({ title: 'Champs requis manquants', status: 'warning' })
      return
    }
    const fd = new FormData()
    fd.append('title', title)
    fd.append('audio', file)

    try {
      await api.post(`/collections/${colId}/tracks`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast({ title: 'Son ajouté à la collection', status: 'success' })
      setTitle('')
      setFile(null)
      setColId('')
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

      <FormControl mb={4}>
        <FormLabel>Fichier audio</FormLabel>
        <Input
          type="file"
          accept="audio/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
      </FormControl>

      <FormControl mb={6}>
        <FormLabel>Collection</FormLabel>
        <Select
          placeholder="Sélectionner une collection"
          value={colId}
          onChange={e => setColId(e.target.value)}
        >
          {collections.map(c => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </FormControl>

      <Button colorScheme="green" onClick={handleSubmit}>
        Ajouter le son
      </Button>
    </Box>
  )
}
