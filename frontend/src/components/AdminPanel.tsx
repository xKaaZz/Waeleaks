// src/components/AdminPanel.tsx
import {
  Box,
  Button,
  Heading,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig'

export default function AdminPanel() {
  const [collections, setCollections] = useState<{ id: number; title: string }[]>([])
  const [tracks, setTracks] = useState<{ id: number; title: string }[]>([])
  const [selectedTrack, setSelectedTrack] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('')
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const collectionsRes = await api.get('/collections/')
      const tracksRes = await api.get('/tracks/')
      setCollections(collectionsRes.data)
      setTracks(tracksRes.data)
    } catch (err) {
      toast({ title: 'Erreur de chargement', status: 'error' })
    }
  }

  const handleDeleteTrack = async () => {
    if (!selectedTrack) return
    try {
      await api.delete(`/tracks/${selectedTrack}`)
      toast({ title: 'Son supprimé', status: 'success' })
      setSelectedTrack('')
      fetchData()
    } catch (err: any) {
      toast({ title: 'Erreur suppression', description: err.response?.data?.detail, status: 'error' })
    }
  }

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return
    try {
      await api.delete(`/collections/${selectedCollection}`)
      toast({ title: 'Collection supprimée', status: 'success' })
      setSelectedCollection('')
      fetchData()
    } catch (err: any) {
      toast({ title: 'Erreur suppression', description: err.response?.data?.detail, status: 'error' })
    }
  }

  return (
    <Box maxW="lg" mx="auto" mt={8}>
      <Heading mb={6}>Panneau d'administration</Heading>
      <VStack spacing={4}>
        <Button colorScheme="blue" width="100%" onClick={() => navigate('/add-collection')}>
          Ajouter une collection
        </Button>
        <Button colorScheme="blue" width="100%" onClick={() => navigate('/add-track')}>
          Ajouter un son
        </Button>

        <Select
          placeholder="Choisir un son à supprimer"
          value={selectedTrack}
          onChange={e => setSelectedTrack(e.target.value)}
        >
          {tracks.map(t => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </Select>
        <Button colorScheme="red" width="100%" onClick={handleDeleteTrack}>
          Supprimer le son
        </Button>

        <Select
          placeholder="Choisir une collection à supprimer"
          value={selectedCollection}
          onChange={e => setSelectedCollection(e.target.value)}
        >
          {collections.map(c => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Button colorScheme="red" width="100%" onClick={handleDeleteCollection}>
          Supprimer la collection
        </Button>
      </VStack>
    </Box>
  )
}
