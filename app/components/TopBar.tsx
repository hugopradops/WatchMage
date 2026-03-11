'use client';

import { useState, useEffect } from 'react';
import MageLogo from './MageLogo';

function FlameIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function NewsIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6z" />
    </svg>
  );
}

export default function TopBar() {
  const [clock, setClock] = useState('');
  const [saleText, setSaleText] = useState('Loading...');
  const [releasesText, setReleasesText] = useState('Loading...');
  const [newsText, setNewsText] = useState('Loading...');

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const date = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setClock(`${date} · ${time}`);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent<{ key: string; value: string }>) => {
      const { key, value } = e.detail;
      if (key === 'sale') setSaleText(value);
      if (key === 'releases') setReleasesText(value);
      if (key === 'news') setNewsText(value);
    };
    window.addEventListener('stat-update', handler as EventListener);
    return () => window.removeEventListener('stat-update', handler as EventListener);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <MageLogo />
        <div className="topbar-brand">
          <h1 className="topbar-title">MageTrack</h1>
          <p className="topbar-subtitle">Your Handy PC Gaming Tool</p>
        </div>
      </div>
      <div className="topbar-center">
        <div className="stat-pill" id="stat-sale">
          <span className="stat-icon">
            <FlameIcon />
          </span>
          <span className="stat-text" id="stat-sale-text">
            {saleText}
          </span>
        </div>
        <div className="stat-pill" id="stat-releases">
          <span className="stat-icon">
            <RocketIcon />
          </span>
          <span className="stat-text" id="stat-releases-text">
            {releasesText}
          </span>
        </div>
        <div className="stat-pill" id="stat-news">
          <span className="stat-icon">
            <NewsIcon />
          </span>
          <span className="stat-text" id="stat-news-text">
            {newsText}
          </span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="hero-clock" id="hero-clock">
          {clock}
        </div>
      </div>
    </header>
  );
}
