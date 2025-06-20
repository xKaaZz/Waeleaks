import { useEffect, useState } from 'react'
import {
  VStack,
  Button,
  Text,
  Center,
  HStack,
  Icon,
  useToast,
  Flex,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import axios from 'axios'
import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import api from '../axiosConfig'

interface Chapter {
  id: number
  number: number
  pages: string[]
}

interface ChapterListProps {
  chapters: Chapter[]
  mangaId: number
}

export default function ChapterList({ chapters, mangaId }: ChapterListProps) {
  const sortedChapters = [...chapters].sort((a, b) => b.number - a.number)
  const [readChapters, setReadChapters] = useState<number[]>([])
  const toast = useToast()

  const fetchReadChapters = async () => {
    try {
      const response = await api.get<number[]>(
        `http://192.168.1.194:8001/api/mangas/${mangaId}/read_chapters`
      )
      setReadChapters(response.data)
    } catch (error) {
      console.error('Erreur récupération chapitres lus', error)
    }
  }

  useEffect(() => {
    fetchReadChapters()
  }, [mangaId])

  const markChapter = async (chapterId: number, read: boolean) => {
    try {
      if (read) {
        await api.post(
          `http://192.168.1.194:8001/api/chapters/${chapterId}/mark_read`
        )
        toast({ title: 'Chapitre marqué comme lu', status: 'success' })
      } else {
        await api.delete(
          `http://192.168.1.194:8001/api/chapters/${chapterId}/mark_read`
        )
        toast({ title: 'Chapitre marqué comme non lu', status: 'info' })
      }
      fetchReadChapters()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: `Impossible de ${read ? 'marquer comme lu' : 'marquer comme non lu'}`,
        status: 'error',
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post(
        `http://192.168.1.194:8001/api/mangas/${mangaId}/mark_all_read`
      )
      toast({ title: 'Tous les chapitres marqués comme lus', status: 'success' })
      fetchReadChapters()
    } catch (err) {
      toast({ title: 'Erreur', description: 'Échec du marquage global', status: 'error' })
    }
  }

  const markAllAsUnread = async () => {
    try {
      await api.delete(
        `http://192.168.1.194:8001/api/mangas/${mangaId}/mark_all_read`
      )
      toast({ title: 'Tous les chapitres marqués comme non lus', status: 'info' })
      fetchReadChapters()
    } catch (err) {
      toast({ title: 'Erreur', description: 'Échec du marquage global', status: 'error' })
    }
  }

  if (chapters.length === 0) {
    return (
      <Center>
        <Text color="gray.500">Aucun chapitre disponible pour le moment</Text>
      </Center>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <Flex justify="space-between" wrap="wrap" gap={2}>
        <Button colorScheme="green" onClick={markAllAsRead}>
          Tout marquer comme lu
        </Button>
        <Button colorScheme="red" variant="outline" onClick={markAllAsUnread}>
          Tout marquer comme non lu
        </Button>
      </Flex>

      {sortedChapters.map((chapter) => {
        const isRead = readChapters.includes(chapter.id)
        return (
          <HStack key={chapter.id} justify="space-between" align="center">
            <RouterLink to={`/chapter/${chapter.id}`}>
              <Button
                variant={isRead ? 'solid' : 'outline'}
                colorScheme={isRead ? 'green' : 'blue'}
                size="lg"
              >
                Chapitre {chapter.number}
              </Button>
            </RouterLink>
            <HStack spacing={2}>
              <Text fontSize="sm" color={isRead ? 'green.600' : 'red.500'}>
                {isRead ? (
                  <>
                    <CheckCircleIcon mr={1} /> Lu
                  </>
                ) : (
                  <>
                    <CloseIcon mr={1} boxSize={3} /> Non lu
                  </>
                )}
              </Text>
              <Button
                size="sm"
                colorScheme={isRead ? 'red' : 'green'}
                onClick={() => markChapter(chapter.id, !isRead)}
                variant="ghost"
              >
                {isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
              </Button>
            </HStack>
          </HStack>
        )
      })}
    </VStack>
  )
}
