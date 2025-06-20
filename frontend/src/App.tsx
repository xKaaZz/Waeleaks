import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CollectionList from './components/CollectionList'
import CollectionDetail from './components/CollectionDetail'
import AddCollectionForm from './components/AddCollectionForm'
import AddTrackForm from './components/AddTrackForm'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import UpdateTelegramPage from './components/UpdateTelegramPage'

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Navbar />
          <Box p={4}>
            <Routes>
              <Route path="/" element={<CollectionList />} />
              <Route path="/collection/:id" element={<CollectionDetail />} />
              <Route path="/collection/:id/add" element={<AddTrackForm />} />
              <Route path="/add" element={<AddCollectionForm />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/update-telegram" element={<UpdateTelegramPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  )
}

export default App
