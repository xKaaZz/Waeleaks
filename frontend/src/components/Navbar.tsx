import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  HStack,
  Spacer,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box bg="blue.600" px={8} py={4} boxShadow="sm">
      <Flex
        maxW="1440px"
        mx="auto"
        align="center"
        justify="space-between"
        wrap="wrap"
      >
        <RouterLink to="/">
          <Heading size="lg" color="white">
            Waeleaks
          </Heading>
        </RouterLink>

        <Spacer />

        <HStack spacing={4}>
          {username ? (
            <>
              <Text color="white">Bonjour, {username}</Text>
              <Button
                size="sm"
                colorScheme="whiteAlpha"
                variant="outline"
                onClick={() => navigate('/add-collection')}
              >
                Ajouter une collection
              </Button>
              <Button
                size="sm"
                colorScheme="whiteAlpha"
                variant="outline"
                onClick={() => navigate('/collection/1/add')} // TODO: rendre dynamique
              >
                Ajouter un son
              </Button>
              <Button colorScheme="red" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <RouterLink to="/login">
                <Button colorScheme="whiteAlpha" size="sm">
                  Connexion
                </Button>
              </RouterLink>
              <RouterLink to="/register">
                <Button colorScheme="whiteAlpha" size="sm">
                  Inscription
                </Button>
              </RouterLink>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}
