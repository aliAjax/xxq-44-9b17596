import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusTag from '../StatusTag'

describe('StatusTag', () => {
  it('should render published status with correct text', () => {
    render(<StatusTag status="published" />)
    expect(screen.getByText('已发布')).toBeInTheDocument()
  })

  it('should render draft status', () => {
    render(<StatusTag status="draft" />)
    expect(screen.getByText('草稿')).toBeInTheDocument()
  })

  it('should have Tailwind CSS classes', () => {
    const { container } = render(<StatusTag status="published" />)
    const span = container.querySelector('span')
    expect(span).toHaveClass('inline-flex')
    expect(span).toHaveClass('rounded-full')
    expect(span).toHaveClass('text-xs')
  })

  it('should render pending status with review stage', () => {
    render(<StatusTag status="pending" reviewStage="first_pending" />)
    expect(screen.getByText('待初审')).toBeInTheDocument()
  })
})
