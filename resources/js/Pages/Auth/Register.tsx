import React from 'react';
import AuthCard from '@/Pages/Auth/AuthCard';

interface RegisterProps {
  selectedTier?: string;
}

export default function Register({ selectedTier }: RegisterProps) {
  return <AuthCard initialMode="signup" selectedTier={selectedTier} />;
}
