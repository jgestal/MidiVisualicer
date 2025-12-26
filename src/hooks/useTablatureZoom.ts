/**
 * Hook para gestionar el zoom de la tablatura
 * Guarda la preferencia en localStorage
 */
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'midi-visualizer-tab-zoom';
const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export function useTablatureZoom() {
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = parseFloat(stored);
                if (!isNaN(parsed) && parsed >= MIN_ZOOM && parsed <= MAX_ZOOM) {
                    setZoom(parsed);
                }
            }
        } catch (error) {
            console.warn('Error loading zoom preference:', error);
        }
    }, []);

    // Save to localStorage
    const saveZoom = useCallback((value: number) => {
        try {
            localStorage.setItem(STORAGE_KEY, value.toString());
        } catch (error) {
            console.warn('Error saving zoom preference:', error);
        }
    }, []);

    const zoomIn = useCallback(() => {
        setZoom(prev => {
            const newZoom = Math.min(MAX_ZOOM, prev + ZOOM_STEP);
            saveZoom(newZoom);
            return Math.round(newZoom * 10) / 10; // Avoid floating point issues
        });
    }, [saveZoom]);

    const zoomOut = useCallback(() => {
        setZoom(prev => {
            const newZoom = Math.max(MIN_ZOOM, prev - ZOOM_STEP);
            saveZoom(newZoom);
            return Math.round(newZoom * 10) / 10;
        });
    }, [saveZoom]);

    const resetZoom = useCallback(() => {
        setZoom(DEFAULT_ZOOM);
        saveZoom(DEFAULT_ZOOM);
    }, [saveZoom]);

    const setZoomLevel = useCallback((value: number) => {
        const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
        setZoom(clamped);
        saveZoom(clamped);
    }, [saveZoom]);

    return {
        zoom,
        zoomIn,
        zoomOut,
        resetZoom,
        setZoomLevel,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        canZoomIn: zoom < MAX_ZOOM,
        canZoomOut: zoom > MIN_ZOOM,
    };
}

export default useTablatureZoom;
