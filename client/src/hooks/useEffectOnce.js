import { useEffect } from 'react';

export function useEffectOnce(effect) {
  useEffect(() => {
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useEffectOnce;
