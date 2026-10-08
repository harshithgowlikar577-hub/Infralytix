import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, CornerDownLeft } from 'lucide-react';

export interface SearchSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onClear?: () => void;
  onSubmit?: (value: string) => void;
  isLoading?: boolean;
  suggestions?: SearchSuggestion[];
  emptyText?: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
  shortcutHint?: string;
  size?: 'md' | 'lg';
  autoComplete?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
  onClear,
  onSubmit,
  isLoading = false,
  suggestions = [],
  emptyText = 'No matching projects found',
  ariaLabel,
  className = '',
  inputClassName = '',
  shortcutHint,
  size = 'md',
  autoComplete = true,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showDropdown = autoComplete && isFocused && (suggestions.length > 0 || (value.trim().length >= 2 && !isLoading));

  // Reset selected keyboard index when suggestions change or dropdown closes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions, showDropdown]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    onChange('');
    onClear?.();
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && selectedIndex >= 0 && selectedIndex < suggestions.length) {
        suggestions[selectedIndex].onClick();
        setIsFocused(false);
        return;
      }
      onSubmit?.(value);
      return;
    }

    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    }
  };

  const heightClass = size === 'lg' ? 'h-[50px] py-3' : 'h-[46px] py-2.5';

  return (
    <div
      ref={containerRef}
      role="search"
      aria-label={ariaLabel || placeholder}
      className={`relative w-full ${className}`}
    >
      <div
        className={`relative flex items-center w-full transition-all duration-200 rounded-2xl bg-[#091529] border shadow-xs ${
          isFocused
            ? 'border-blue-500/90 ring-2 ring-blue-500/20 bg-[#0C1B33] shadow-[0_0_18px_rgba(59,130,246,0.18)]'
            : 'border-[#1E3354] hover:border-[#2D4A77] hover:bg-[#0B182E]'
        }`}
      >
        {/* Left Fixed Search Icon / Spinner */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          ) : (
            <Search
              className={`w-4 h-4 transition-colors duration-200 ${
                isFocused ? 'text-blue-400' : 'text-slate-400'
              }`}
            />
          )}
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel || placeholder}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          className={`w-full bg-transparent pl-11 pr-14 text-sm font-normal text-slate-100 placeholder-slate-400 focus:outline-none transition-all ${heightClass} ${inputClassName}`}
        />

        {/* Right Controls (Clear Button / Loading / Shortcut Badge) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && (
            <span className="text-[11px] font-medium text-blue-400/90 hidden sm:inline-block animate-pulse">
              Searching...
            </span>
          )}

          {value ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search input"
              title="Clear search (Esc)"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : shortcutHint ? (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-[#14233D] rounded-md border border-[#1E3354] select-none">
              {shortcutHint}
            </span>
          ) : null}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-2 bg-[#091529]/95 backdrop-blur-xl border border-[#1E3354] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <div className="p-1.5 space-y-1">
              {suggestions.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      item.onClick();
                      setIsFocused(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-[#122240] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="truncate">
                        <div className="text-sm font-semibold text-slate-100 truncate">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-slate-400 truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.badgeColor || 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-7 px-4 text-center">
              <Search className="w-6 h-6 text-slate-500 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-200">{emptyText}</p>
              <p className="text-xs text-slate-400 mt-1">
                Try checking for typos or broaden your search keywords.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
