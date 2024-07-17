"use client"

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircleIcon, StarIcon } from 'lucide-react';

interface Artist {
  id: string;
  artist_name: string;
  artist_image_url: string;
  popularity_at_claim: number;
  claim_date: string;
}
interface SavedArtistsProps {
    artists: Artist[];
    isLoading: boolean;
  }
  
  export default function SavedArtists({ artists, isLoading }: SavedArtistsProps) {
    console.log('SavedArtists render', { artists, isLoading });
  
    if (isLoading) {
      return <div>Loading...</div>;
    }
  
    if (artists.length === 0) {
      return <div>No saved artists found.</div>;
    }
  
    return (
      <div>
        <h2>Saved Artists</h2>
        {artists.map((artist) => (
          <div key={artist.id}>
            <img src={artist.artist_image_url} alt={artist.artist_name} width={100} height={100} />
            <h3>{artist.artist_name}</h3>
            <p>Popularity at claim: {artist.popularity_at_claim}</p>
            <p>Claimed on: {new Date(artist.claim_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    );
  }