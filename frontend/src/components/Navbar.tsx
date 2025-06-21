import { Box, Flex, Button, Heading, Text, Spacer } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { username, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box bg="blue.600" px={8} py={4} w="100%">
      <Flex align="center" maxW="1200px" mx="auto" gap={6}>
        <RouterLink to="/">
          <Heading size="lg" color="white">
            Waeleaks
          </Heading>
        </RouterLink>

        {username && (
          <Text color="white" fontWeight="medium">
            Bonjour, {username}
          </Text>
        )}

        <Spacer />

        <Flex gap={3}>
          {username ? (
            <>
              {isAdmin && (
                <RouterLink to="/admin">
                  <Button variant="outline" colorScheme="yellow">
                    Gérer bibliothèque
                  </Button>
                </RouterLink>
              )}
              <RouterLink to="/update-telegram">
                <Button variant="outline" colorScheme="whiteAlpha">
                  Lier Telegram
                </Button>
              </RouterLink>
              <Button colorScheme="red" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <RouterLink to="/login">
                <Button variant="solid" colorScheme="whiteAlpha">
                  Connexion
                </Button>
              </RouterLink>
              <RouterLink to="/register">
                <Button variant="solid" colorScheme="whiteAlpha">
                  Inscription
                </Button>
              </RouterLink>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
