import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComplaintForm from '../components/ComplaintForm';
import axios from 'axios';

jest.mock('axios');

describe('ComplaintForm', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders all form fields', () => {
    render(<ComplaintForm />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('validates empty/invalid fields and shows errors', async () => {
    render(<ComplaintForm />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/must be/i).length).toBeGreaterThan(0);
    });
  });

  it('shows success message after valid submission', async () => {
    axios.post.mockResolvedValueOnce({});
    render(<ComplaintForm />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Valid Title' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A valid description story here.' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'SERVICE' } });
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Alice Bob' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('shows API error message if submission fails', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Backend error!' } } });
    render(<ComplaintForm />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Some Valid Title' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'This is a sample valid description.' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'INFRASTRUCTURE' } });
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@user.com' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/backend error/i)).toBeInTheDocument();
    });
  });
});
