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
  const [allTracks, setAllTracks] = useState<Track[]>([])
  const [trackId, setTrackId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<Collection[]>('/collections/')
      .then(res => setCollections(res.data))
      .catch(() => toast({ title: 'Erreur chargement collections', status: 'error' }))

    api.get<Track[]>('/tracks/')
      .then(res => setAllTracks(res.data))
      .catch(() => toast({ title: 'Erreur chargement sons', status: 'error' }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (collectionId) {
        if (!trackId) {
          toast({ title: 'Sélectionnez un son existant', status: 'warning' })
          setLoading(false)
          return
        }
        await api.post(`/collections/${collectionId}/add-track/${trackId}`)
        toast({ title: 'Son ajouté à la collection !', status: 'success' })
      } else {
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
            <FormControl isRequired>
              <FormLabel>Choisir un son existant</FormLabel>
              <Select
                placeholder="Sélectionnez un son"
                value={trackId}
                onChange={e => setTrackId(e.target.value)}
              >
                {allTracks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
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
            {collectionId ? 'Ajouter à la collection' : 'Uploader le son'}
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
