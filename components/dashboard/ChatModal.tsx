'use client';

// ============================================================
// CHAT MODAL — mensajería en tiempo real entre adoptante y rescatista
// Se abre desde ApplicationCard. Usa Firestore onSnapshot para
// actualizar mensajes sin necesidad de recargar.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { Message, AdoptionApplication } from '@/types';
import { sendMessage, subscribeToMessages, markMessagesAsRead } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface ChatModalProps {
  application: AdoptionApplication;
  onClose: () => void;
}

export function ChatModal({ application, onClose }: ChatModalProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Suscripción en tiempo real a los mensajes de esta conversación
  useEffect(() => {
    const unsub = subscribeToMessages(
      application.id,
      (msgs) => { setMessages(msgs); setChatError(''); },
      () => setChatError('El chat no está disponible aún. Esperá unos segundos y volvé a intentarlo.')
    );
    return unsub; // cleanup al desmontar
  }, [application.id]);

  // Marcar mensajes como leídos al abrir el chat
  useEffect(() => {
    if (!profile) return;
    markMessagesAsRead(application.id, profile.id).catch(console.error);
  }, [application.id, profile]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !profile || sending) return;

    setSending(true);
    setText('');
    textareaRef.current?.focus();

    try {
      await sendMessage({
        conversationId: application.id,
        senderId: profile.id,
        senderName: profile.name,
        senderPhoto: profile.photoURL,
        text: trimmed,
        participants: [application.applicantId, application.ownerId],
        read: false,
      });
    } catch (err) {
      console.error('[chat] sendMessage error:', err);
      setText(trimmed); // devuelvo el texto para que no lo pierda
      setChatError('No se pudo enviar el mensaje. Intentá de nuevo.');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envía, Shift+Enter hace salto de línea
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!profile) return null;

  // Nombre de la otra persona para mostrar en el header
  const isApplicant = profile.id === application.applicantId;
  const otherName = isApplicant ? application.catName : application.applicantName;
  const subtitle = isApplicant
    ? `Hablás con el rescatista de ${application.catName}`
    : `Hablás con ${application.applicantName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel del chat */}
      <div
        className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl shadow-2xl flex flex-col"
        style={{ height: 'min(560px, 90vh)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              {application.catName}
            </p>
            <p className="text-xs text-gray-400 truncate">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error */}
        {chatError && (
          <div className="mx-4 mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            {chatError}
          </div>
        )}

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center select-none">
              <span className="text-4xl mb-3">💬</span>
              <p className="text-sm font-medium text-gray-600">¡Empezá la conversación!</p>
              <p className="text-xs text-gray-400 mt-1">
                Podés coordinar la visita o hacer preguntas acá.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === profile.id;
              const time = msg.createdAt
                ? (msg.createdAt as Timestamp).toDate().toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div key={msg.id} className={cn('flex gap-2 items-end', isMe ? 'flex-row-reverse' : 'flex-row')}>
                  <Avatar
                    src={msg.senderPhoto}
                    name={msg.senderName}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className={cn('flex flex-col max-w-[72%]', isMe ? 'items-end' : 'items-start')}>
                    {!isMe && (
                      <p className="text-[11px] text-gray-400 mb-1 ml-1">{msg.senderName}</p>
                    )}
                    <div
                      className={cn(
                        'px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words',
                        isMe
                          ? 'bg-coral-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      )}
                    >
                      {msg.text}
                    </div>
                    {time && (
                      <p className={cn('text-[10px] text-gray-400 mt-1', isMe ? 'mr-1' : 'ml-1')}>
                        {time}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu mensaje… (Enter para enviar)"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-transparent transition-all"
            style={{ maxHeight: 96 }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="p-2.5 rounded-2xl bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Enviar mensaje"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
