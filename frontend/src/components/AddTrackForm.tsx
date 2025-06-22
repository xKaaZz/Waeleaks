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
import { useParams, useNavigate } from 'react-router-dom'
import api from '../axiosConfig'

interface Collection {
  id: number
  title: string
}

interface Track {
  id: number
  title: string
  audio_url: string
  collection_id: number | null
}

export default function AddTrackForm() {
  const { id: prefilledCollectionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [collections, setCollections]     = useState<Collection[]>([])
  const [collectionId, setCollectionId]   = useState<string>('')
  const [standaloneTracks, setStandalone] = useState<Track[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string>('')
  const [title, setTitle]                 = useState('')
  const [file, setFile]                   = useState<File | null>(null)
  const [loading, setLoading]             = useState(false)

  // 1️⃣ Charger les collections & track libres
  useEffect(() => {
    api.get<Collection[]>('/collections/')
      .then(res => {
        setCollections(res.data)
        if (prefilledCollectionId) {
          setCollectionId(prefilledCollectionId)
        }
      })
      .catch(() => toast({ status: 'error', title: `Impossible de charger les collections` }))

    api.get<Track[]>('/tracks/')
      .then(res => {
        // ne garder que ceux sans collection
        setStandalone(res.data.filter(t => t.collection_id === null))
      })
      .catch(() => toast({ status: 'error', title: `Impossible de charger les sons libres` }))
  }, [prefilledCollectionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // si on veut rattacher un son existant à une collection
    if (collectionId && selectedTrackId) {
      setLoading(true)
      try {
        await api.put(`/tracks/${selectedTrackId}`, { collection_id: collectionId })
        toast({ status: 'success', title: `Son rattaché à la collection !` })
        navigate(`/collection/${collectionId}`)
      } catch (err: any) {
        toast({
          status: 'error',
          title: `Erreur lors du rattachement`,
          description: err.response?.data?.detail || err.message,
        })
      } finally {
        setLoading(false)
      }
      return
    }

    // sinon, création (standalone ou nouveau fichier)
    if (!title || (!file && !collectionId)) {
      toast({ status: 'warning', title: `Titre et fichier requis` })
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    if (file) formData.append('audio', file)

    setLoading(true)
    try {
      if (collectionId) {
        // upload direct dans la collection
        await api.post(`/collections/${collectionId}/tracks`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        // track standalone
        await api.post('/tracks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      toast({ status: 'success', title: `Son ajouté avec succès` })
      navigate(collectionId ? `/collection/${collectionId}` : '/tracks')
    } catch (err: any) {
      toast({
        status: 'error',
        title: `Erreur à l’ajout`,
        description: err.response?.data?.detail || err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="lg" mx="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* Choix de collection */}
          <FormControl>
            <FormLabel>Collection (facultatif)</FormLabel>
            <Select
              placeholder="Aucune collection"
              value={collectionId}
              onChange={e => {
                setCollectionId(e.target.value)
                setSelectedTrackId('')
              }}
            >
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </FormControl>

          {/* Si collection choisie => on rattache un track existant */}
          {collectionId ? (
            <FormControl isRequired>
              <FormLabel>Choisir un son déjà uploadé</FormLabel>
              <Select
                placeholder="Sélectionner un son"
                value={selectedTrackId}
                onChange={e => setSelectedTrackId(e.target.value)}
              >
                {standaloneTracks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              {/* Sinon on crée un nouveau son */}
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

          <Button
            type="submit"
            colorScheme="green"
            isLoading={loading}
            w="full"
          >
            {collectionId
              ? selectedTrackId
                ? 'Rattacher le son'
                : 'Uploader dans la collection'
              : 'Ajouter le son'}
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
