import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AIAssistant from '@/components/AIAssistant';
vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));
describe('deferred markdown keeps chat usable', () => {
  it('opens the launcher, renders the welcome message and closes without contacting AI', async () => {
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network disabled in unit test'));
    render(<MemoryRouter><AIAssistant /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close chat' })).toBeVisible());
    expect(network).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close chat' }));
    expect(screen.queryByRole('button', { name: 'Close chat' })).toBeNull();
    network.mockRestore();
  });
});
