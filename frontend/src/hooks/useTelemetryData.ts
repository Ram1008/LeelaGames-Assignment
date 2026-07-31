import { useState, useEffect } from 'react';
import { MapId, MapSummary, MatchRecord } from '../types';

export function useTelemetryData(activeMap: MapId) {
  const [summary, setSummary] = useState<MapSummary | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState<MatchRecord | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState<boolean>(false);

  // Load Map Summary JSON when map changes
  useEffect(() => {
    let isSubscribed = true;
    setIsLoadingSummary(true);

    fetch(`/data/${activeMap}.json`)
      .then((res) => res.json())
      .then((data: MapSummary) => {
        if (!isSubscribed) return;
        setSummary(data);
        setIsLoadingSummary(false);
        if (data.matches && data.matches.length > 0) {
          setSelectedMatchId(data.matches[0].match_id);
        } else {
          setSelectedMatchId(null);
          setCurrentMatch(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load map summary:', err);
        if (isSubscribed) setIsLoadingSummary(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [activeMap]);

  // Load per-match JSON when selectedMatchId changes
  useEffect(() => {
    if (!selectedMatchId || !activeMap) return;
    let isSubscribed = true;
    setIsLoadingMatch(true);

    fetch(`/data/matches/${activeMap}/${selectedMatchId}.json`)
      .then((res) => res.json())
      .then((data: MatchRecord) => {
        if (!isSubscribed) return;
        setCurrentMatch(data);
        setIsLoadingMatch(false);
      })
      .catch((err) => {
        console.error('Failed to load match record:', err);
        if (isSubscribed) setIsLoadingMatch(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedMatchId, activeMap]);

  return {
    summary,
    selectedMatchId,
    setSelectedMatchId,
    currentMatch,
    isLoadingSummary,
    isLoadingMatch,
  };
}
