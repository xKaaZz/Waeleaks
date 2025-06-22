import { useEffect, useRef, useState } from 'react'
import { 
  Box, 
  IconButton, 
  HStack, 
  Text, 
  Slider, 
  SliderTrack, 
  SliderFilledTrack, 
  SliderThumb 
} from '@chakra-ui/react'
import { FiPlay, FiPause, FiSkipBack, FiSkipForward } from 'react-icons/fi'

interface Sound {
  title: string
  url: string
}

interface AudioPlayerProps {
  playlist: Sound[]
  currentIndex: number
  onSelectTrack: (idx: number) => void
  hasInteracted: boolean
  onProgress?: (progress: number) => void  // <-- passe en optionnel
}

export default function AudioPlayer({
  playlist,
  currentIndex,
  onSelectTrack,
  hasInteracted,
  onProgress,          // peut être undefined
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // Au chargement des métadonnées : on récupère la durée
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
    // on informe l'avancement initial à 0
    onProgress?.(0)
  }

  // À chaque « timeupdate », on met à jour l'état et on appelle onProgress si défini
  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    const ct = audioRef.current.currentTime
    setCurrentTime(ct)
    if (duration > 0) {
      onProgress?.(ct / duration)
    }
  }

  // Quand la piste se termine, on avance automatiquement
  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      onSelectTrack(currentIndex + 1)
    } else {
      setIsPlaying(false)
    }
  }

  // Jouer / mettre en pause selon isPlaying
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => { /* Ignorer erreurs autoplay */ })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentIndex])

  // Si l'utilisateur interagit (sélection carte ou bouton album), on démarre
  useEffect(() => {
    if (hasInteracted) setIsPlaying(true)
  }, [hasInteracted, currentIndex])

  // Handlers pour skip precedent / suivant
  const prevTrack = () => {
    if (currentIndex > 0) {
      onSelectTrack(currentIndex - 1)
    }
  }
  const nextTrack = () => {
    if (currentIndex < playlist.length - 1) {
      onSelectTrack(currentIndex + 1)
    }
  }

  // Seek via slider
  const handleSeek = (val: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val
      setCurrentTime(val)
      onProgress?.(val / duration)
    }
  }

  return (
    <Box
      borderWidth="1px"
      p={4}
      borderRadius="md"
      bg="white"
      w="100%"
    >
      <HStack spacing={4}>
        <IconButton
          aria-label="Précédent"
          icon={<FiSkipBack />}
          onClick={prevTrack}
          isDisabled={currentIndex === 0}
        />
        <IconButton
          aria-label={isPlaying ? 'Pause' : 'Play'}
          icon={isPlaying ? <FiPause /> : <FiPlay />}
          onClick={() => setIsPlaying(!isPlaying)}
        />
        <IconButton
          aria-label="Suivant"
          icon={<FiSkipForward />}
          onClick={nextTrack}
          isDisabled={currentIndex === playlist.length - 1}
        />
        <Text fontWeight="bold">{playlist[currentIndex].title}</Text>
      </HStack>

      <HStack mt={4} spacing={3}>
        <Text>{Math.floor(currentTime)}</Text>
        <Slider
          value={currentTime}
          min={0}
          max={duration}
          flex="1"
          onChange={handleSeek}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Text>{Math.floor(duration)}</Text>
      </HStack>

      <audio
        ref={audioRef}
        src={playlist[currentIndex].url}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{ display: 'none' }}
      />
    </Box>
  )
}
