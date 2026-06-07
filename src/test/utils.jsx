import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'

export function renderWithRouter(ui, { route = '/', ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <AppProvider>
          {children}
        </AppProvider>
      </MemoryRouter>
    )
  }
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

export function renderWithRouterOnly(ui, { route = '/', ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  }
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

export * from '@testing-library/react'
