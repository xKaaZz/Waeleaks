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
  const [collectionIds, setCollectionIds] = useState<string[]>( 
    prefillCollection ? [prefillCollection] : []
  )
  const [existingTracks, setExistingTracks] = useState<Track[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string>('')

  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // charger toutes les collections
  useEffect(() => {
    api
      .get<Collection[]>('/collections')
      .then(res => setCollections(res.data))
      .catch(() =>
        toast({ title: 'Erreur chargement collections', status: 'error' })
      )
  }, [toast])

  // charger les tracks si une ou plusieurs collections sélectionnées
  useEffect(() => {
    if (collectionIds.length > 0) {
      // on récupère l'union de tous les tracks des collections
      Promise.all(
        collectionIds.map(id =>
          api.get<Track[]>(`/collections/${id}/tracks`)
        )
      )
        .then(results => {
          const all: Track[] = []
          results.forEach(r =>
            r.data.forEach(t => {
              if (!all.find(x => x.id === t.id)) all.push(t)
            })
          )
          setExistingTracks(all)
        })
        .catch(() =>
          toast({ title: 'Impossible de charger pistes existantes', status: 'error' })
        )
    } else {
      setExistingTracks([])
      setSelectedTrackId('')
    }
  }, [collectionIds, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (collectionIds.length > 0 && selectedTrackId) {
        // rattacher un track existant à N collections
        await api.put(`/tracks/${selectedTrackId}`, {
          collection_ids: collectionIds.map(Number),
        })
        toast({ title: 'Son mis à jour dans les collections !', status: 'success' })
      } else {
        // créer un nouveau track indépendant
        if (!title.trim() || !file) {
          toast({ title: 'Tous les champs sont requis', status: 'warning' })
          setLoading(false)
          return
        }
        const formData = new FormData()
        formData.append('title', title)
        formData.append('audio', file)
        const res = await api.post('/tracks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        // si on a aussi sélectionné des collections on met à jour immédiatement
        if (collectionIds.length > 0) {
          await api.put(`/tracks/${res.data.id}`, {
            collection_ids: collectionIds.map(Number),
          })
        }
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

          {/* Sélection multiple de collections */}
          <FormControl>
            <FormLabel>Collections (facultatif)</FormLabel>
            <Select
              multiple
              value={collectionIds}
              onChange={e =>
                setCollectionIds(
                  Array.from(e.target.selectedOptions, o => o.value)
                )
              }
              size="lg"
              h="auto"
            >
              {collections.map(c => (
                <option key={c.id} value={c.id.toString()}>
                  {c.title}
                </option>
              ))}
            </Select>
            <Text fontSize="sm" color="gray.500">
              (ctrl/cmd+click pour plusieurs)
            </Text>
          </FormControl>

          {collectionIds.length > 0 && (
            <FormControl isRequired>
              <FormLabel>Choisir un son existant</FormLabel>
              <Select
                placeholder="Sélectionnez un son"
                value={selectedTrackId}
                onChange={e => setSelectedTrackId(e.target.value)}
              >
                {existingTracks.map(t => (
                  <option key={t.id} value={t.id.toString()}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}

          {collectionIds.length === 0 && (
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
            {collectionIds.length > 0 ? 'Rattacher le son' : 'Ajouter le son'}
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
