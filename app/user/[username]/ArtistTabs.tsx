"use client"

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SavedArtists from '@/components/SavedArtists'

interface Artist {
  id: string;
  artist_name: string;
  artist_image_url: string;
  popularity_at_claim: number;
  claim_date: string;
}

interface ArtistTabsProps {
  userId: string;
}

export default function ArtistTabs({ userId }: ArtistTabsProps) {
    const [savedArtists, setSavedArtists] = useState<Artist[]>([]);
    const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  
    useEffect(() => {
      console.log('ArtistTabs useEffect', { userId });
      async function fetchSavedArtists() {
        if (savedArtists.length > 0) {
          console.log('Artists already loaded, skipping fetch');
          return;
        }
        setIsLoadingArtists(true);
        try {
          console.log('Fetching artists...');
          const response = await fetch(`/api/saved-artists?userId=${userId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch saved artists');
          }
          const data = await response.json();
          console.log('Fetched artists:', data);
          setSavedArtists(data);
        } catch (error) {
          console.error('Error fetching saved artists:', error);
        } finally {
          setIsLoadingArtists(false);
        }
      }
  
      fetchSavedArtists();
    }, [userId, savedArtists]);
  
    console.log('ArtistTabs render', { savedArtists, isLoadingArtists });

  return (
    <Tabs defaultValue="artists">
      <TabsList className="mb-6 flex items-center justify-between">
        {/* ... your existing tabs ... */}
      </TabsList>
      <TabsContent value="songs">
        {/* ... your existing songs content ... */}
      </TabsContent>
      <TabsContent value="youtube">
        {/* ... your existing youtube content ... */}
      </TabsContent>
      <TabsContent value="artists">
        <SavedArtists 
          artists={savedArtists} 
          isLoading={isLoadingArtists} 
        />
      </TabsContent>
    </Tabs>
  );
}