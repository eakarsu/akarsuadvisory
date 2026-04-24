import { useEffect } from 'react';

export default function useSEO(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | Akarsu Advisory` : 'Akarsu Advisory';
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [title, description]);
}
