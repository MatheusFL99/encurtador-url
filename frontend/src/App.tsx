import React, { useState } from 'react';
import './App.css';

interface UrlDetails {
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  expiresAt: string | null;
}

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [customExpiresIn, setCustomExpiresIn] = useState('');
  const [urlDetails, setUrlDetails] = useState<UrlDetails | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setUrlDetails(null);
    setCopyButtonText('Copy');

    if (!originalUrl) {
      setError('Please enter a URL');
      return;
    }

    let finalExpiresIn = expiresIn;
    if (expiresIn === -1) {
      finalExpiresIn = Number(customExpiresIn);
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl, expiresIn: finalExpiresIn }),
      });

      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }

      const data = await response.json();
      setShortUrl(`${apiUrl}/${data.shortUrl}`);
      fetchUrlDetails(data.shortUrl);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const fetchUrlDetails = async (shortUrl: string) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/url/${shortUrl}`);
      if (!response.ok) {
        throw new Error('Failed to fetch URL details');
      }
      const data = await response.json();
      setUrlDetails(data);
    } catch (err) {
      setError('An error occurred while fetching URL details.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy'), 2000);
  };

  return (
    <div className="container">
      <h1>URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter URL to shorten"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
        />
        <select value={expiresIn} onChange={(e) => setExpiresIn(Number(e.target.value))}>
          <option value={0}>Never</option>
          <option value={3600}>1 Hour</option>
          <option value={86400}>1 Day</option>
          <option value={604800}>1 Week</option>
          <option value={-1}>Custom</option>
        </select>
        {expiresIn === -1 && (
          <input
            type="number"
            placeholder="Seconds"
            value={customExpiresIn}
            onChange={(e) => setCustomExpiresIn(e.target.value)}
          />
        )}
        <button type="submit">Shorten</button>
      </form>
      {shortUrl && (
        <div className="result">
          <p>Shortened URL:</p>
          <div>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
            <button onClick={handleCopy}>{copyButtonText}</button>
          </div>
          {urlDetails && (
            <div>
              <p>Clicks: {urlDetails.clicks}</p>
              <button onClick={() => fetchUrlDetails(urlDetails.shortUrl)}>Refresh</button>
            </div>
          )}
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;