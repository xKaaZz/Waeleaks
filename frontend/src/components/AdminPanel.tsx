import { Box, Heading, VStack, Button, Select, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig'

export default function AdminPanel() {
  const navigate = useNavigate()
  const toast = useToast()
  const [collections, setCollections] = useState<any[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [selectedCollectionId, setSelectedCollectionId] = useState('')

  useEffect(() => {
    api.get('/collections/').then(res => setCollections(res.data))
  }, [])

  const handleDeleteTrack = async () => {
    if (!selectedTrackId) return
    await api.delete(`/tracks/${selectedTrackId}`)
    toast({ title: 'Son supprimé', status: 'success' })
    setSelectedTrackId('')
  }

  const handleDeleteCollection = async () => {
    if (!selectedCollectionId) return
    try {
      await api.delete(`/collections/${selectedCollectionId}`)
      toast({ title: 'Collection supprimée', status: 'success' })
      setCollections(cols => cols.filter(c => c.id !== Number(selectedCollectionId)))
      setSelectedCollectionId('')
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.response?.data?.detail, status: 'error' })
    }
  }

  return (
    <Box maxW="container.md" mx="auto" mt={8}>
      <Heading mb={6}>Panneau d'administration</Heading>
      <VStack spacing={4} align="stretch">
        <Button colorScheme="blue" onClick={() => navigate('/add-collection')}>
          Ajouter une collection
        </Button>
        <Button colorScheme="blue" onClick={() => navigate('/add-track')}>
          Ajouter un son
        </Button>

        <Select
          placeholder="Choisir un son à supprimer"
          value={selectedTrackId}
          onChange={e => setSelectedTrackId(e.target.value)}
        >
          {collections.flatMap(col =>
            col.tracks.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.title} ({col.title})
              </option>
            ))
          )}
        </Select>
        <Button colorScheme="red" onClick={handleDeleteTrack}>
          Supprimer le son
        </Button>

        <Select
          placeholder="Choisir une collection à supprimer"
          value={selectedCollectionId}
          onChange={e => setSelectedCollectionId(e.target.value)}
        >
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </Select>
        <Button colorScheme="red" onClick={handleDeleteCollection}>
          Supprimer la collection
        </Button>
      </VStack>
    </Box>
  )
}
