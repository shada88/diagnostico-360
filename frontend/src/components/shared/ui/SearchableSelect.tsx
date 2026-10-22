"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Option {
    label: string;
    value: string;
    description?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Seleccionar...", error }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        opt.value.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setSearch("");
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            {/* Trigger */}
            <div
                className={cn(
                    "w-full px-4 py-2.5 rounded-xl outline-none transition-all flex items-center justify-between cursor-text",
                    error ? "ring-1 ring-red-500/40" : ""
                )}
                style={{
                    background: 'var(--surface-subtle)',
                    border: `1px solid ${isOpen ? 'var(--gold)' : 'rgba(201,168,76,0.18)'}`,
                    color: 'var(--text-pearl)',
                    boxShadow: isOpen ? '0 0 0 2px var(--gold-glow)' : 'none',
                }}
                onClick={toggleOpen}
            >
                {isOpen ? (
                    <input
                        autoFocus
                        type="text"
                        className="w-full bg-transparent outline-none p-0 border-none"
                        style={{ color: 'var(--text-pearl)' }}
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                ) : (
                    <span className={cn("truncate")}
                        style={{ color: selectedOption ? 'var(--text-pearl)' : 'var(--text-muted)' }}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                )}
                <svg
                    className={cn("w-5 h-5 transition-transform flex-shrink-0 ml-2", isOpen && "rotate-180")}
                    style={{ color: 'var(--text-muted)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--gold-20)',
                    }}>
                    {filteredOptions.length === 0 ? (
                        <div className="p-3 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                            No se encontraron resultados
                        </div>
                    ) : (
                        <ul className="py-1">
                            {filteredOptions.map((opt) => (
                                <li
                                    key={opt.value}
                                    className="px-4 py-2 text-sm cursor-pointer transition-colors flex justify-between items-center"
                                    style={{
                                        color: value === opt.value ? 'var(--gold)' : 'var(--text-soft)',
                                        background: value === opt.value ? 'var(--gold-08)' : 'transparent',
                                        fontWeight: value === opt.value ? 600 : 400,
                                    }}
                                    onMouseEnter={e => {
                                        if (value !== opt.value) {
                                            e.currentTarget.style.background = 'var(--gold-06)';
                                            e.currentTarget.style.color = 'var(--text-pearl)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (value !== opt.value) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-soft)';
                                        }
                                    }}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span>{opt.label}</span>
                                    {opt.description && (
                                        <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                                            {opt.description}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
