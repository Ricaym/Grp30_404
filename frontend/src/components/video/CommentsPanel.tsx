import { useState, type FormEvent } from 'react';
import { Clock, MessageSquare, Reply, Send } from 'lucide-react';
import { isStudentComment } from '@/data/mockCollaboration';
import { formatTimestamp } from '@/lib/utils';
import type { VideoComment } from '@/types/collaboration';

interface CommentsPanelProps {
  comments: VideoComment[];
  currentTime: number;
  isAdmin: boolean;
  adminId: string;
  onAddComment: (text: string) => void;
  onAddReply: (commentId: string, text: string) => void;
  onSeek: (timestamp: number) => void;
}

export function CommentsPanel({
  comments,
  currentTime,
  isAdmin,
  adminId,
  onAddComment,
  onAddReply,
  onSeek,
}: CommentsPanelProps) {
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    onAddComment(text);
    setText('');
  };

  const handleReplySubmit = (event: FormEvent, commentId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!replyText.trim()) return;
    onAddReply(commentId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const questionCount = comments.filter((c) => isStudentComment(c, adminId)).length;

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm">
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-text-primary">
            {isAdmin ? 'Questions des étudiants' : 'Questions horodatées'}
          </h2>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {isAdmin
            ? `${questionCount} question${questionCount !== 1 ? 's' : ''} — répondez ci-dessous`
            : 'Posez une question à un instant précis de la vidéo'}
        </p>
      </header>

      <div className="max-h-80 space-y-2 overflow-y-auto p-4">
        {comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">
            {isAdmin
              ? 'Aucune question pour le moment.'
              : 'Aucune question. Posez-en une pendant la lecture.'}
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-border bg-surface-muted p-3"
            >
              <button
                type="button"
                onClick={() => onSeek(comment.timestamp)}
                className="w-full text-left transition hover:opacity-80"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(comment.timestamp)}
                  </span>
                  <span className="truncate text-xs text-text-muted">{comment.author}</span>
                </div>
                <p className="mt-1.5 text-sm text-text-secondary">{comment.text}</p>
              </button>

              {comment.replies.length > 0 && (
                <div className="mt-3 space-y-2 border-l-2 border-brand-200 pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="rounded-lg bg-brand-50/60 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-brand-700">{reply.author}</span>
                        <span className="text-[10px] text-text-muted">Formateur</span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {isAdmin && isStudentComment(comment, adminId) && (
                <div className="mt-3 border-t border-border pt-3">
                  {replyingTo === comment.id ? (
                    <form
                      onSubmit={(event) => handleReplySubmit(event, comment.id)}
                      className="space-y-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <textarea
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        placeholder="Votre réponse à l'étudiant..."
                        rows={2}
                        className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Publier la réponse
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReplyingTo(comment.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Répondre à ce commentaire
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!isAdmin && (
        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          <p className="mb-2 text-xs text-text-muted">
            Timestamp actuel :{' '}
            <span className="font-semibold text-brand-600">{formatTimestamp(currentTime)}</span>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Posez votre question..."
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
