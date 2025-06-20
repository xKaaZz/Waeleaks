import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import MangaList from './components/MangaList'
import MangaDetail from './components/MangaDetail'
import ChapterViewer from './components/ChapterViewer'
import AddMangaForm from './components/AddMangaForm'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import UpdateTelegramPage from './components/UpdateTelegramPage'
import { AuthProvider } from './context/AuthContext' // ✅ ICI on importe le provider

function App() {
  return (
    <ChakraProvider>
      <AuthProvider> {/* ✅ ICI on encapsule toute l'app */}
        <Router>
          <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Box p={4}>
              <Routes>
                <Route path="/" element={<MangaList />} />
                <Route path="/add" element={<AddMangaForm />} />
                <Route path="/manga/:id" element={<MangaDetail />} />
                <Route path="/chapter/:id" element={<ChapterViewer />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/update-telegram" element={<UpdateTelegramPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  )
}

export default App
