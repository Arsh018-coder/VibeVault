import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce } from '../../hooks/useEffectOnce';

const MyTicketsPage = () => {
  const navigate = useNavigate();

  useEffectOnce(() => {
    // Redirect to the cart page
    navigate('/cart', { replace: true });
  });

  return null;
};

export default MyTicketsPage;