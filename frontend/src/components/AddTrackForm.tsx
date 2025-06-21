import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import api from '../axiosConfig'

export default function AddTrackForm() {
  const toast = useToast()
  const [collections, setCollections] = useState<{ id: number; title: string }[]>([])
  const [collectionId, setCollectionId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/collections/').then(res => setCollections(res.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collectionId || !title || !file) {
      toast({ title: 'Tous les champs sont requis', status: 'warning' })
      return
    }
    const fd = new FormData()
    fd.append('title', title)
    fd.append('audio', file)

    setLoading(true)
    try {
      await api.post(`/collections/${collectionId}/tracks`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast({ title: 'Son ajouté !', status: 'success' })
      setTitle(''); setFile(null); setCollectionId('')
    } catch (err: any) {
      toast({ title: 'Erreur à l’ajout', description: err.response?.data?.detail, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="lg" mx="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Collection</FormLabel>
            <Select
              placeholder="Sélectionnez une collection"
              value={collectionId}
              onChange={e => setCollectionId(e.target.value)}
            >
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Titre du son</FormLabel>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Titre…"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Fichier audio</FormLabel>
            <Input
              type="file"
              accept="audio/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="green"
            isLoading={loading}
            width="full"
          >
            Ajouter le son
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
