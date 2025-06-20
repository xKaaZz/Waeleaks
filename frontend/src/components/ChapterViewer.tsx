import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Center,
  Container,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import api from '../axiosConfig'

interface Chapter {
  id: number
  number: number
  pages: string[]
  manga_id: number
  next_chapter_id?: number
  previous_chapter_id?: number
}

export default function ChapterViewer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMarkedRead, setHasMarkedRead] = useState(false)

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await api.get(`http://192.168.1.194:8001/api/chapters/${id}`)
        setChapter(response.data)
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le chapitre',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchChapter()
    }
  }, [id, navigate, toast])

  useEffect(() => {
    if (chapter && currentPage === chapter.pages.length - 1 && !hasMarkedRead) {
      handleMarkAsRead()
    }
  }, [currentPage, chapter, hasMarkedRead])

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleNextPage = () => {
    if (chapter && currentPage < chapter.pages.length - 1) {
      setCurrentPage(currentPage + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleMarkAsRead = async () => {
    try {
      await api.post(`http://192.168.1.194:8001/api/chapters/${chapter?.id}/mark_read`)
      setHasMarkedRead(true)
      toast({
        title: 'Chapitre marqué comme lu',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer le chapitre comme lu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const renderNavButtons = () => (
    <HStack spacing={4} mt={4} wrap="wrap" justify="center">
      {chapter?.previous_chapter_id && (
        <Button
          onClick={() => navigate(`/chapter/${chapter.previous_chapter_id}`)}
          colorScheme="gray"
        >
          ← Chapitre précédent
        </Button>
      )}
      {chapter?.next_chapter_id && (
        <Button
          onClick={() => navigate(`/chapter/${chapter.next_chapter_id}`)}
          colorScheme="blue"
        >
          Lire le chapitre suivant →
        </Button>
      )}
    </HStack>
  )

  if (isLoading) {
    return (
      <Center h="90vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!chapter) {
    return (
      <Center h="90vh">
        <Text>Chapitre non trouvé</Text>
      </Center>
    )
  }

  return (
    <Container maxW="100%" px={{ base: 0, md: 4 }} py={4}>
      <VStack spacing={4}>
        <HStack spacing={4} w="100%" px={4} justify="space-between" flexWrap="wrap">
          <Button onClick={() => navigate(`/manga/${chapter.manga_id}`)} colorScheme="blue" variant="outline">
            Retour au manga
          </Button>
          <Text fontSize="xl" fontWeight="bold" textAlign="center">
            Chapitre {chapter.number} - Page {currentPage + 1}/{chapter.pages.length}
          </Text>
          <HStack>
            <Button onClick={handlePreviousPage} isDisabled={currentPage === 0} colorScheme="blue">
              Page précédente
            </Button>
            <Button
              onClick={handleNextPage}
              isDisabled={currentPage === chapter.pages.length - 1}
              colorScheme="blue"
            >
              Page suivante
            </Button>
          </HStack>
        </HStack>

        {renderNavButtons()}

        <Box
          w="100%"
          maxW="1000px"
          mx="auto"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bg="white"
          position="relative"
        >
          <Image
            src={chapter.pages[currentPage]}
            alt={`Page ${currentPage + 1}`}
            w="100%"
            h="auto"
            objectFit="contain"
            loading="eager"
          />

          <Box
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            w="50%"
            onClick={handlePreviousPage}
            cursor="pointer"
            zIndex={1}
          />

          <Box
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            w="50%"
            onClick={handleNextPage}
            cursor="pointer"
            zIndex={1}
          />
        </Box>

        {renderNavButtons()}

        {currentPage === chapter.pages.length - 1 && !hasMarkedRead && (
          <Button onClick={handleMarkAsRead} colorScheme="green" mt={2}>
            Marquer comme lu
          </Button>
        )}
      </VStack>
    </Container>
  )
}