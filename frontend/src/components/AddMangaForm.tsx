import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../axiosConfig'

interface MangaFormData {
  title: string;
  description?: string;
  cover_url?: string;
}

export default function AddMangaForm() {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('http://192.168.1.194:8001/api/mangas/', {
        title: title.trim(),
      });

      toast({
        title: 'Manga ajouté avec succès',
        description: 'Le manga est en cours d\'importation. Les chapitres seront ajoutés automatiquement.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate(`/manga/${response.data.id}`);
    } catch (error: any) {
      console.error('Error adding manga:', error);
      setError(
        error.response?.data?.detail ||
        'Une erreur est survenue lors de l\'ajout du manga. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel>Titre du manga</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre exact du manga (ex: One Piece)"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            isDisabled={!title.trim() || isLoading}
            width="full"
          >
            Ajouter le manga
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
