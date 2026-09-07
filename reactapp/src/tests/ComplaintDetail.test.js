import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ComplaintDetail from '../components/ComplaintDetail';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('axios');

describe('ComplaintDetail', () => {
  const fakeComplaint = {
    id: 5,
    title: 'Resolved Complaint',
    description: 'Details about a resolved complaint.',
    category: 'SERVICE',
    status: 'RESOLVED',
    priority: 'HIGH',
    submittedBy: 'Bob',
    submitterEmail: 'bob@example.com',
    submittedDate: '2024-06-30T13:00:00',
    resolvedDate: '2024-07-02T20:05:00',
    assignedTo: 'Admin',
    resolutionComments: 'Fixed the problem.'
  };

  beforeEach(() => { jest.clearAllMocks(); });

  it('testComplaintFormRendering', async () => {
    axios.get.mockResolvedValueOnce({ data: fakeComplaint });
    render(
      <MemoryRouter initialEntries={[`/complaints/5`]}>
        <Routes>
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('Resolved Complaint')).toBeInTheDocument();
    expect(screen.getByText(/SERVICE/i)).toBeInTheDocument();
    expect(screen.getByText(/resolved date/i)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/fixed the problem./i)).toBeInTheDocument();
  });

  it('testComplaintFormValidation', async () => {
    axios.get.mockRejectedValueOnce({ response: { data: { message: 'Not found!' }}});
    render(
      <MemoryRouter initialEntries={[`/complaints/17`]}>
        <Routes><Route path="/complaints/:id" element={<ComplaintDetail />} /></Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /back to list/i }));
  });
});
