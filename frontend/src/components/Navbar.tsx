import {
  Box, Flex, Heading, IconButton,
  HStack, Show, Hide, useDisclosure, Drawer,
  DrawerOverlay, DrawerContent, DrawerCloseButton,
  DrawerBody, VStack, Button
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { username, isAdmin, logout } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box bg="blue.600">
      <Flex
        maxW="container.xl" mx="auto"
        px={{ base: 4, md: 8 }} py={4}
        direction={{ base: 'column', md: 'row' }}
        align="center" justify="space-between" wrap="wrap"
      >
        <RouterLink to="/">
          <Heading size="md" color="white">Waeleaks</Heading>
        </RouterLink>

        <Show below="md">
          <IconButton
            aria-label="Menu" icon={<HamburgerIcon />}
            onClick={onOpen} variant="ghost" color="white"
          />
        </Show>

        <Hide below="md">
          <HStack spacing={4}>
            {username
              ? <>
                  {isAdmin && <RouterLink to="/admin"><Button size="sm">Gérer</Button></RouterLink>}
                  <RouterLink to="/update-telegram"><Button size="sm">Telegram</Button></RouterLink>
                  <Button size="sm" colorScheme="red" onClick={logout}>Déco</Button>
                </>
              : <>
                  <RouterLink to="/login"><Button size="sm">Connexion</Button></RouterLink>
                  <RouterLink to="/register"><Button size="sm">Inscription</Button></RouterLink>
                </>
            }
          </HStack>
        </Hide>
      </Flex>

      {/* Drawer mobile */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody mt={8}>
            <VStack spacing={4} align="start">
              {username
                ? <>
                    {isAdmin && <RouterLink to="/admin"><Button w="full">Gérer bibliothèque</Button></RouterLink>}
                    <RouterLink to="/update-telegram"><Button w="full">Lier Telegram</Button></RouterLink>
                    <Button w="full" colorScheme="red" onClick={logout}>Déconnexion</Button>
                  </>
                : <>
                    <RouterLink to="/login"><Button w="full">Connexion</Button></RouterLink>
                    <RouterLink to="/register"><Button w="full">Inscription</Button></RouterLink>
                  </>
              }
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
