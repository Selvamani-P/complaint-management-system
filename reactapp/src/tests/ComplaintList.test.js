import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComplaintList from '../components/ComplaintList';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');

const fakeComplaints = [
  { id: 1, title: 'A title', status: 'PENDING', priority: 'MEDIUM', submittedDate: '2024-06-28T12:00:00' },
  { id: 2, title: 'B complaint', status: 'RESOLVED', priority: 'LOW', submittedDate: '2024-06-27T08:30:00' }
];

describe('ComplaintList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: [ ...fakeComplaints ] });
  });

  it('testComplaintListRendering', async () => {
    render(<MemoryRouter><ComplaintList /></MemoryRouter>);
    const title1 = await screen.findByText('A title');
    expect(title1).toBeInTheDocument();
    const title2 = screen.getByText('B complaint');
    expect(title2).toBeInTheDocument();
    expect(screen.getAllByText(/pending|resolved/i).length).toBeGreaterThan(0);
  });

  it('testComplaintDetailView', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/status/RESOLVED')) return Promise.resolve({ data: [fakeComplaints[1]] });
      return Promise.resolve({ data: fakeComplaints });
    });
    render(<MemoryRouter><ComplaintList /></MemoryRouter>);
    await screen.findByText('A title');
    fireEvent.change(screen.getByTestId('status-filter'), { target: { value: 'RESOLVED' } });
    const bComp = await screen.findByText('B complaint');
    expect(bComp).toBeInTheDocument();
    expect(screen.queryByText('A title')).toBeNull();
  });

  it('testComplaintStatusFilter', async () => {
    render(<MemoryRouter><ComplaintList /></MemoryRouter>);
    await screen.findByText('A title');
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'A title' } });
    expect(screen.getByText('A title')).toBeInTheDocument();
    expect(screen.queryByText('B complaint')).toBeNull();
  });

  it('shows empty state if none returned', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<MemoryRouter><ComplaintList /></MemoryRouter>);
    expect(await screen.findByText(/no complaints/i)).toBeInTheDocument();
  });
});
