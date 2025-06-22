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
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../axiosConfig'

interface Collection {
  id: number
  title: string
}

interface Track {
  id: number
  title: string
  collection_id: number | null
}

export default function AddTrackForm() {
  const { id: prefilledCollectionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  // liste des collections
  const [collections, setCollections] = useState<Collection[]>([])
  // liste des tracks hors collection
  const [orphanTracks, setOrphanTracks] = useState<Track[]>([])

  // champs du form
  const [collectionId, setCollectionId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [trackIdToAttach, setTrackIdToAttach] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // on récupère collections + tracks orphelines
  useEffect(() => {
    api.get<Collection[]>('/collections/').then(res => {
      setCollections(res.data)
      if (prefilledCollectionId) {
        setCollectionId(prefilledCollectionId)
      }
    })
    api
      .get<Track[]>('/tracks?collection_id=null') // backend doit supporter ce filtre
      .then(res => setOrphanTracks(res.data))
      .catch(() => {
        // si backend n'a pas ce filtre, fallback sur tous puis filter client-side
        api.get<Track[]>('/tracks').then(r2 => {
          setOrphanTracks(r2.data.filter(t => t.collection_id === null))
        })
      })
  }, [prefilledCollectionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // validation
    if (!title.trim() && !trackIdToAttach) {
      return toast({ title: 'Donnez un titre', status: 'warning' })
    }
    if (!collectionId) {
      // hors collection → on doit avoir un fichier
      if (!file) return toast({ title: 'Sélectionnez un fichier audio', status: 'warning' })
    } else {
      // dans une collection → on doit avoir choisi un track à rattacher
      if (!trackIdToAttach) {
        return toast({ title: 'Choisissez un son à rattacher', status: 'warning' })
      }
    }

    setLoading(true)
    try {
      if (!collectionId) {
        // 1) création d'un nouveau son hors collection
        const formData = new FormData()
        formData.append('title', title.trim())
        formData.append('audio', file!)
        await api.post('/tracks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast({ title: 'Son créé !', status: 'success' })
        setTitle('')
        setFile(null)
      } else {
        // 2) rattacher un son existant à la collection
        await api.put(`/tracks/${trackIdToAttach}`, {
          collection_id: Number(collectionId),
        })
        toast({ title: 'Son rattaché à la collection !', status: 'success' })
        // on redirige directement vers la page detail de la collection
        return navigate(`/collection/${collectionId}`)
      }
    } catch (err: any) {
      // extraire un message lisible
      let msg = err.response?.data?.detail || err.message
      if (Array.isArray(msg)) {
        msg = msg.map((o: any) => o.msg || JSON.stringify(o)).join('\n')
      }
      toast({
        title: 'Erreur à l’ajout',
        description: msg,
        status: 'error',
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="lg" mx="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">

          {/* choix de la collection */}
          <FormControl>
            <FormLabel>Collection (facultatif)</FormLabel>
            <Select
              placeholder="Aucune collection"
              value={collectionId}
              onChange={e => {
                setCollectionId(e.target.value)
                // on réinitialise le reste
                setTrackIdToAttach('')
                setFile(null)
                setTitle('')
              }}
            >
              {collections.map(c => (
                <option key={c.id} value={c.id.toString()}>
                  {c.title}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Titre (toujours requis si on crée) */}
          {!collectionId && (
            <FormControl isRequired>
              <FormLabel>Titre du son</FormLabel>
              <Input
                placeholder="Titre…"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </FormControl>
          )}

          {/* Upload vs rattachement */}
          {collectionId ? (
            <FormControl isRequired>
              <FormLabel>Choisir un son existant</FormLabel>
              <Select
                placeholder="Sélectionnez un son"
                value={trackIdToAttach}
                onChange={e => setTrackIdToAttach(e.target.value)}
              >
                {orphanTracks.map(t => (
                  <option key={t.id} value={t.id.toString()}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl isRequired>
              <FormLabel>Fichier audio</FormLabel>
              <Input
                type="file"
                accept="audio/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </FormControl>
          )}

          <Button
            type="submit"
            colorScheme="green"
            isLoading={loading}
            width="full"
          >
            {collectionId ? 'Rattacher le son' : 'Ajouter le son'}
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
