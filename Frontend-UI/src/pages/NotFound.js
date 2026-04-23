import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px'
    }}>
      <div style={{ fontSize: '6rem', marginBottom: 16 }}>🍽</div>
      <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1, marginBottom: 8 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Page not found</h2>
      <p style={{ color: 'var(--text-mid)', maxWidth: 360, marginBottom: 32 }}>
        Looks like this recipe doesn't exist. Head back home and find something delicious.
      </p>
      <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;
