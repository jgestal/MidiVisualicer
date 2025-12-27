/**
 * BookmarksPanel - UI for managing song bookmarks
 * 
 * @description Allows users to:
 * - View saved bookmarks in a list
 * - Click to jump to a bookmark
 * - Add/edit/delete bookmarks
 * - Quick add at current position
 */
import { memo, useState, useCallback } from 'react';
import { Bookmark, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import type { Bookmark as BookmarkType } from '../hooks/useBookmarks';
import './BookmarksPanel.css';

// ============================================
// Types
// ============================================

interface BookmarksPanelProps {
  /** List of bookmarks for current song */
  bookmarks: BookmarkType[];
  /** Current playback time */
  currentTime: number;
  /** Whether more bookmarks can be added */
  canAddMore: boolean;
  /** Callback when bookmark is clicked */
  onSeek: (time: number) => void;
  /** Callback to add bookmark at current time */
  onAdd: (time: number, name?: string) => void;
  /** Callback to update bookmark */
  onUpdate: (id: string, updates: { name?: string }) => void;
  /** Callback to delete bookmark */
  onDelete: (id: string) => void;
  /** Callback to clear all bookmarks */
  onClear: () => void;
}

// ============================================
// Helpers
// ============================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// Sub-Components
// ============================================

interface BookmarkItemProps {
  bookmark: BookmarkType;
  isActive: boolean;
  onSeek: (time: number) => void;
  onUpdate: (id: string, updates: { name?: string }) => void;
  onDelete: (id: string) => void;
}

const BookmarkItem = memo(function BookmarkItem({
  bookmark,
  isActive,
  onSeek,
  onUpdate,
  onDelete,
}: BookmarkItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(bookmark.name);

  const handleSave = useCallback(() => {
    if (editName.trim()) {
      onUpdate(bookmark.id, { name: editName.trim() });
    }
    setIsEditing(false);
  }, [bookmark.id, editName, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditName(bookmark.name);
    setIsEditing(false);
  }, [bookmark.name]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  }, [handleSave, handleCancel]);

  return (
    <div
      className={`bookmark-item ${isActive ? 'bookmark-item--active' : ''}`}
      style={{ '--bookmark-color': bookmark.color } as React.CSSProperties}
    >
      <div
        className="bookmark-color-indicator"
        style={{ backgroundColor: bookmark.color }}
      />

      {isEditing ? (
        <div className="bookmark-edit">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bookmark-edit-input"
          />
          <button onClick={handleSave} className="bookmark-btn" title="Guardar">
            <Check size={14} />
          </button>
          <button onClick={handleCancel} className="bookmark-btn" title="Cancelar">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <button
            className="bookmark-main"
            onClick={() => onSeek(bookmark.time)}
            title={`Ir a ${formatTime(bookmark.time)}`}
          >
            <span className="bookmark-name">{bookmark.name}</span>
            <span className="bookmark-time">{formatTime(bookmark.time)}</span>
          </button>

          <div className="bookmark-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="bookmark-btn"
              title="Editar"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => onDelete(bookmark.id)}
              className="bookmark-btn bookmark-btn--danger"
              title="Eliminar"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
});

// ============================================
// Main Component
// ============================================

export const BookmarksPanel = memo(function BookmarksPanel({
  bookmarks,
  currentTime,
  canAddMore,
  onSeek,
  onAdd,
  onUpdate,
  onDelete,
  onClear,
}: BookmarksPanelProps) {
  // Find active bookmark (closest to current time within 1 second)
  const activeBookmark = bookmarks.find(b =>
    Math.abs(b.time - currentTime) < 1
  );

  const handleQuickAdd = useCallback(() => {
    onAdd(currentTime);
  }, [currentTime, onAdd]);

  if (bookmarks.length === 0) {
    return (
      <div className="bookmarks-panel bookmarks-panel--empty">
        <Bookmark size={24} className="bookmarks-empty-icon" />
        <p>Sin marcadores</p>
        <button
          className="bookmarks-add-btn"
          onClick={handleQuickAdd}
          disabled={!canAddMore}
        >
          <Plus size={14} />
          Añadir marcador aquí
        </button>
      </div>
    );
  }

  return (
    <div className="bookmarks-panel">
      <div className="bookmarks-header">
        <h4>
          <Bookmark size={16} />
          Marcadores ({bookmarks.length})
        </h4>
        <div className="bookmarks-header-actions">
          {canAddMore && (
            <button
              className="bookmarks-add-btn"
              onClick={handleQuickAdd}
              title="Añadir marcador en posición actual"
            >
              <Plus size={14} />
            </button>
          )}
          <button
            className="bookmarks-clear-btn"
            onClick={onClear}
            title="Eliminar todos"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="bookmarks-list">
        {bookmarks.map((bookmark) => (
          <BookmarkItem
            key={bookmark.id}
            bookmark={bookmark}
            isActive={activeBookmark?.id === bookmark.id}
            onSeek={onSeek}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
});

export default BookmarksPanel;
