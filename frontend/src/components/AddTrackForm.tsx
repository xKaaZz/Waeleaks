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

  // liste des collections existantes
  const [collections, setCollections] = useState<{ id: number; title: string }[]>([])
  // collection sélectionnée (vide = hors collection)
  const [collectionId, setCollectionId] = useState<string>(prefilledCollectionId || '')

  // quand on choisit une collection, liste ses tracks
  const [existingTracks, setExistingTracks] = useState<{ id: number; title: string }[]>([])
  // track sélectionné pour rattachement
  const [selectedTrackId, setSelectedTrackId] = useState<string>('')
  // pour création de track standalone
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)

  // 1) charger toutes les collections
  useEffect(() => {
    api.get('/collections/').then(res => {
      setCollections(res.data)
      if (prefilledCollectionId) {
        setCollectionId(prefilledCollectionId)
      }
    })
  }, [prefilledCollectionId])

  // 2) si une collection est sélectionnée, charger ses tracks existants
  useEffect(() => {
    if (!collectionId) {
      setExistingTracks([])
      setSelectedTrackId('')
      return
    }
    api
      .get('/tracks', { params: { collection_id: collectionId } })
      .then(res => setExistingTracks(res.data))
      .catch(() => setExistingTracks([]))
  }, [collectionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // validation
    if (collectionId) {
      if (!selectedTrackId) {
        toast({ title: 'Veuillez choisir un son existant', status: 'warning' })
        return
      }
    } else {
      if (!title.trim() || !file) {
        toast({ title: 'Titre et fichier requis', status: 'warning' })
        return
      }
    }

    setLoading(true)
    try {
      if (collectionId) {
        // rattacher un track existant à la collection
        await api.put(`/tracks/${selectedTrackId}`, {
          collection_id: Number(collectionId),
        })
      } else {
        // créer un nouveau track standalone
        const formData = new FormData()
        formData.append('title', title)
        formData.append('audio', file!)
        await api.post('/tracks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      toast({ title: 'Son ajouté avec succès !', status: 'success' })
      // reset du formulaire
      setTitle('')
      setFile(null)
      setCollectionId('')
      setSelectedTrackId('')
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
          {/* 1. Choix de la collection */}
          <FormControl>
            <FormLabel>Collection (facultatif)</FormLabel>
            <Select
              placeholder="Aucune collection"
              value={collectionId}
              onChange={e => setCollectionId(e.target.value)}
            >
              {collections.map(c => (
                <option key={c.id} value={c.id.toString()}>
                  {c.title}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* 2a. Si on est dans une collection → rattacher son existant */}
          {collectionId ? (
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
          ) : (
            /* 2b. Sinon → uploader un nouveau son */
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
