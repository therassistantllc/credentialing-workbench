import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

it('renders the Credentialing Workbench shell with a main landmark', () => {
  render(
    <RootLayout>
      <p>Workspace content</p>
    </RootLayout>,
  );

  expect(screen.getByText('Credentialing Workbench')).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveTextContent('Workspace content');
});
