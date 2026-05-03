import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App component without crashing', () => {
  render(<App />);
  const linkElement = screen.getAllByText(/admin login/i)[0];
  expect(linkElement).toBeInTheDocument();
});
