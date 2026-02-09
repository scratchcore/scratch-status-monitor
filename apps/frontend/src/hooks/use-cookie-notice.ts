import {
  createCollection,
  eq,
  localStorageCollectionOptions,
  useLiveQuery,
} from "@tanstack/react-db";
import { z } from "zod";

const cookieNoticeSchema = z.object({
  id: z.literal("cookie-notice"),
  closedAt: z.number(),
});

type CookieNotice = z.infer<typeof cookieNoticeSchema>;

const cookieNoticeCollection = createCollection(
  localStorageCollectionOptions({
    id: "cookie-notice",
    storageKey: "cookie-notice-state",
    getKey: (item: CookieNotice) => item.id,
    schema: cookieNoticeSchema,
  })
);

/**
 * クッキー通知を閉じた状態を保存します
 */
const closeCookieNotice = () => {
  cookieNoticeCollection.insert({
    id: "cookie-notice",
    closedAt: Date.now(),
  });
};

/**
 * クッキー通知の表示状態を取得するカスタムフック
 * @param days - 経過日数の閾値（デフォルト: 365日）
 */
export const useCookieNoticeVisible = (days: number = 365) => {
  const { data } = useLiveQuery((q) =>
    q.from({ notice: cookieNoticeCollection }).where(({ notice }) => eq(notice.id, "cookie-notice"))
  );

  const notice = data?.[0];

  const isOpen = !notice || (Date.now() - notice.closedAt) / (1000 * 60 * 60 * 24) >= days;

  return {
    isOpen,
    close: closeCookieNotice,
  };
};
