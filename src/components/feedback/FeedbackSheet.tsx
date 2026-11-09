"use client";

import { useEffect, useState } from "react";
import { Sheet, Stars } from "@/components/ui/Controls";
import { POINTS } from "@/data/config";
import { FEEDBACK_QUESTIONS } from "@/data/options";
import { useApp } from "@/store/AppStore";

/**
 * Post-shopping survey: opens automatically once after an order is picked up.
 * If dismissed, it can still be filled in from the order history.
 */
export function FeedbackSheet({ orderId, onClose }: { orderId: string | null; onClose?: () => void }) {
  const { data, submitFeedback, dismissFeedback, notify } = useApp();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRatings({});
    setComment("");
    setError(null);
  }, [orderId]);

  if (!data || !orderId) return null;
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return null;

  const close = () => {
    if (data.pendingFeedback === orderId) dismissFeedback();
    onClose?.();
  };

  return (
    <Sheet
      open
      onClose={close}
      title="Com'è andata la spesa?"
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <button type="button" className="btn-secondary" onClick={close}>
            Più tardi
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (!ratings.overall) return setError("Dai almeno una valutazione all'esperienza complessiva.");
              submitFeedback(orderId, ratings, comment.trim());
              notify(`Grazie! +${POINTS.feedback} punti`);
              onClose?.();
            }}
          >
            Invia feedback · +{POINTS.feedback} punti
          </button>
        </div>
      }
    >
      <p className="text-[14px] leading-relaxed text-ink-600">
        Ordine <strong>{order.id}</strong> da {order.storeName}. Ci vuole un minuto e aiuta il supermercato a migliorare.
      </p>
      <div className="mt-4 space-y-4">
        {FEEDBACK_QUESTIONS.map((q) => (
          <div key={q.id}>
            <p className="text-[14px] font-semibold text-ink-900">{q.label}</p>
            <Stars value={ratings[q.id] ?? 0} onChange={(n) => setRatings((r) => ({ ...r, [q.id]: n }))} label={q.label} />
          </div>
        ))}
        <div>
          <label htmlFor="fb-comment" className="field-label">Commento (facoltativo)</label>
          <textarea id="fb-comment" className="input min-h-[96px] resize-y" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Cosa possiamo migliorare?" />
        </div>
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13.5px] text-rose-700">{error}</p>}
      </div>
    </Sheet>
  );
}
