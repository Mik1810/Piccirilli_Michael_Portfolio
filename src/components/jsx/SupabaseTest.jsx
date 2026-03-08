import React, { useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const SupabaseTest = () => {
  useEffect(() => {
    const testConnection = async () => {
      // Sostituisci 'experiences' con il nome di una tabella esistente
      const { data, error } = await supabase.from('experiences').select('*');
      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('Supabase data:', data);
      }
    };
    testConnection();
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Supabase Connection Test</h2>
      <p>Controlla la console per il risultato.</p>
    </div>
  );
};

export default SupabaseTest;
