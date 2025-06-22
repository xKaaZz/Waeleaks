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
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../axiosConfig'

interface Collection {
  id: number
  title: string
}
interface Track {
  id: number
  title: string
}

export default function AddTrackForm() {
  const { id: prefillCollection } = useParams<{ id: string }>()
  const toast = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionId, setCollectionId] = useState<string>(prefillCollection || '')
  const [existingTracks, setExistingTracks] = useState<Track[]>([])
  const [trackId, setTrackId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // Charge toutes les collections
  useEffect(() => {
    api
      .get<Collection[]>('/collections')
      .then(res => setCollections(res.data))
      .catch(() => toast({ title: 'Erreur chargement collections', status: 'error' }))
  }, [])

  // Dès qu’on choisit une collection, récupère ses pistes
  useEffect(() => {
    if (collectionId) {
      api
        .get<Track[]>(`/collections/${collectionId}/tracks`)
        .then(res => setExistingTracks(res.data))
        .catch(() =>
          toast({ title: 'Impossible de charger les sons existants', status: 'error' })
        )
    } else {
      setExistingTracks([])
      setTrackId('')
    }
  }, [collectionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (collectionId) {
        // On rattache un son existant
        if (!trackId) {
          toast({ title: 'Sélectionnez d’abord un son existant', status: 'warning' })
          setLoading(false)
          return
        }
        await api.put(`/tracks/${trackId}`, { collection_id: Number(collectionId) })
        toast({ title: 'Son rattaché à la collection !', status: 'success' })
      } else {
        // On ajoute un nouveau son “libre”
        if (!title.trim() || !file) {
          toast({ title: 'Tous les champs sont requis', status: 'warning' })
          setLoading(false)
          return
        }
        const formData = new FormData()
        formData.append('title', title)
        formData.append('audio', file)
        await api.post('/tracks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast({ title: 'Nouveau son ajouté !', status: 'success' })
        setTitle('')
        setFile(null)
      }
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.response?.data?.detail || err.message,
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box maxW="lg" mx="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* Choix de la collection */}
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

          {collectionId ? (
            <>
              {/* Si on a choisi une collection, on rattache un son existant */}
              <FormControl isRequired>
                <FormLabel>Choisir un son existant</FormLabel>
                <Select
                  placeholder="Sélectionnez un son"
                  value={trackId}
                  onChange={e => setTrackId(e.target.value)}
                >
                  {existingTracks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            <>
              {/* Sans collection, on crée un nouveau son */}
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
            </>
          )}

          <Button type="submit" colorScheme="green" width="full">
            {collectionId ? 'Rattacher le son' : 'Ajouter le son'}
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
