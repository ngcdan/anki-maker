import { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook để navigate với React 18 startTransition
 * Giải quyết vấn đề "suspended while responding to synchronous input"
 */
export function useTransitionNavigate() {
  const navigate = useNavigate();

  return (to: string, options?: { replace?: boolean }) => {
    startTransition(() => {
      navigate(to, options);
    });
  };
}

/**
 * Hook để handle link clicks với transition
 */
export function useTransitionLink() {
  const navigate = useTransitionNavigate();

  return (to: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(to);
  };
}

export default useTransitionNavigate;