// src/components/AddTrackForm.tsx
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
import { useParams } from 'react-router-dom'
import api from '../axiosConfig'

export default function AddTrackForm() {
  const { id: prefilledCollectionId } = useParams<{ id: string }>()
  const toast = useToast()
  const [collections, setCollections] = useState<{ id: number; title: string }[]>([])
  const [collectionId, setCollectionId] = useState<string>('') // vide = hors collection
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/collections/').then(res => {
      setCollections(res.data)
      if (prefilledCollectionId) {
        setCollectionId(prefilledCollectionId)
      }
    })
  }, [prefilledCollectionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !file) {
      toast({ title: 'Tous les champs sont requis', status: 'warning' })
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('audio', file)

    setLoading(true)
    try {
      if (collectionId) {
        await api.post(`/collections/${collectionId}/tracks`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await api.post('/tracks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      toast({ title: 'Son ajouté !', status: 'success' })
      setTitle('')
      setFile(null)
      setCollectionId('')
    } catch (err: any) {
      toast({
        title: 'Erreur à l’ajout',
        description: err.response?.data?.detail || err.message,
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="lg" mx="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl>
            <FormLabel>Collection (facultatif)</FormLabel>
            <Select
              placeholder="Aucune collection"
              value={collectionId}
              onChange={e => setCollectionId(e.target.value)}
            >
              {collections.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Titre du son</FormLabel>
            <Input
              placeholder="Titre…"
              value={title}
              onChange={e => setTitle(e.target.value)}
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
