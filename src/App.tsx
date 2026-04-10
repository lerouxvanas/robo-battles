import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

import { VoxelEditor } from './features/voxel-editor/VoxelEditor'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#101218',
      paper: '#0f1821',
    },
    primary: {
      main: '#f59f45',
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VoxelEditor />
    </ThemeProvider>
  )
}

export default App
