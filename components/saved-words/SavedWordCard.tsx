"use client";

import Link from "next/link";
import { useState } from "react";
import { appText } from "@/components/app/app-typography";
import Spinner from "@/components/feedback/Spinner";
import { difficultyLabel, previewText } from "@/lib/saved-words/format";
import type { SavedWordItem } from "@/lib/saved-words/types";
import { useI18n } from "@/lib/i18n/provider";
import StatusBadge from "./StatusBadge";

type SavedWordCardProps = {
  item: SavedWordItem;
  onOpenDetail: (item: SavedWordItem) => void;
  onReviewAgain: (item: SavedWordItem) => Promise<void>;
  onRemove: (item: SavedWordItem) => Promise<void>;
};

export default function SavedWordCard({
  item,
  onOpenDetail,
  onReviewAgain,
  onRemove
}: SavedWordCardProps) {
  const { t } = useI18n();
  const [reviewPending, setReviewPending] = useState(false);
  const [removePending, setRemovePending] = useState(false);

  const definitionPreview = previewText(item.definition || item.meaning, 100);
  const contextPreview = previewText(item.contextualMeaning, 110);
  const level = difficultyLabel(item.difficulty);

  const handleReview = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (reviewPending) {
      return;
    }

    setReviewPending(true);
    try {
      await onReviewAgain(item);
    } finally {
      setReviewPending(false);
    }
  };

  const handleRemove = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (removePending) {
      return;
    }

    setRemovePending(true);
    try {
      await onRemove(item);
    } catch {
      setRemovePending(false);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetail(item);
        }
      }}
      className="group flex cursor-pointer flex-col rounded-xl border border-white/[0.12] bg-[#12141d] p-5 text-left shadow-[0_8px_32px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-[#141820] hover:shadow-[0_16px_48px_rgba(124,140,255,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-medium tracking-tight text-zinc-100 group-hover:text-white">
            {item.word}
          </h2>
          {item.pronunciation ? (
            <p className="mt-1 text-sm text-zinc-500">{item.pronunciation}</p>
          ) : null}
        </div>
        <StatusBadge status={item.status} />
      </div>

      {definitionPreview ? (
        <p className="mt-4 text-[14px] leading-relaxed text-zinc-300">{definitionPreview}</p>
      ) : null}

      {contextPreview ? (
        <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-500">
          <span className={appText.label}>{t("app.savedWordInContext")} · </span>
          {contextPreview}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
        <span className="truncate">{item.source}</span>
        <span aria-hidden="true">·</span>
        <span>{t("app.savedWordSavedAt")} {item.savedAt}</span>
        {level ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{level}</span>
          </>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.08] pt-4">
        <button
          type="button"
          disabled={reviewPending}
          onClick={handleReview}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/[0.16] hover:text-zinc-200 disabled:opacity-50"
        >
          {reviewPending ? <Spinner className="h-3 w-3" /> : null}
          {t("app.savedWordReviewAgain")}
        </button>

        {item.documentId ? (
          <Link
            href={`/reader/${item.documentId}`}
            onClick={(event) => event.stopPropagation()}
            className="rounded-md border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/[0.16] hover:text-zinc-200"
          >
            {t("app.savedWordOpenSource")}
          </Link>
        ) : null}

        <button
          type="button"
          disabled={removePending}
          onClick={handleRemove}
          className="rounded-md border border-white/[0.08] bg-transparent px-3 py-1.5 text-xs text-zinc-500 transition hover:border-red-500/25 hover:bg-red-500/[0.06] hover:text-red-300/90 disabled:opacity-50"
        >
          {removePending ? t("app.savedWordRemoving") : t("app.savedWordRemove")}
        </button>
      </div>
    </article>
  );
}
