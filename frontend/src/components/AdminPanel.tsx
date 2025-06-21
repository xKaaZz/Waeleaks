// Nouveau fichier AdminPanel.tsx 
import { Box, Heading, VStack, Button, useToast, Select } from '@chakra-ui/react'
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
    fetchData()
  }, [])

  const fetchData = async () => {
    const res = await api.get('/collections/')
    setCollections(res.data)
  }

  const handleDeleteTrack = async () => {
    if (!selectedTrackId) return
    await api.delete(`/tracks/${selectedTrackId}`)
    toast({ title: 'Son supprimé', status: 'success' })
  }

  const handleDeleteCollection = async () => {
    if (!selectedCollectionId) return
    try {
      await api.delete(`/collections/${selectedCollectionId}`)
      toast({ title: 'Collection supprimée', status: 'success' })
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.response?.data?.detail, status: 'error' })
    }
  }

  return (
    <Box maxW="container.md" mx="auto" mt={8}>
      <Heading mb={6}>Panneau d'administration</Heading>
      <VStack spacing={4}>
        <Button onClick={() => navigate('/add-collection')} colorScheme="blue" width="full">
          Ajouter une collection
        </Button>
        <Button onClick={() => navigate('/add-track')} colorScheme="blue" width="full">
          Ajouter un son (hors collection)
        </Button>
        <Button onClick={() => navigate('/collection/1/add')} colorScheme="blue" width="full">
          Ajouter un son dans une collection
        </Button>

        {/* Suppression d'un son */}
        <Select placeholder="Choisir un son à supprimer" onChange={(e) => setSelectedTrackId(e.target.value)}>
          {collections.flatMap((col) =>
            col.tracks.map((track: any) => (
              <option key={track.id} value={track.id}>
                {track.title} ({col.title})
              </option>
            ))
          )}
        </Select>
        <Button colorScheme="red" width="full" onClick={handleDeleteTrack}>
          Supprimer le son sélectionné
        </Button>

        {/* Suppression d'une collection */}
        <Select placeholder="Choisir une collection à supprimer" onChange={(e) => setSelectedCollectionId(e.target.value)}>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>
              {col.title}
            </option>
          ))}
        </Select>
        <Button colorScheme="red" width="full" onClick={handleDeleteCollection}>
          Supprimer la collection sélectionnée
        </Button>
      </VStack>
    </Box>
  )
}
