import { useMemo } from "react";
import { Tracker } from "../ui/tracker";

function getRandomIntInclusive(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // 上限を含み、下限も含む
}

export function MonitorDemo() {
  const item = Array.from({ length: 2016 }).map((_, index: number) => ({
    ok: getRandomIntInclusive(0, 100) > 1 ? true : false,
  }));

  /**
   * デモ用のデータを生成する
   *
   * 1. アイテムを60箱に分ける
   * 　　- 各箱は、全て品質（ok）が `true` の場合、`1` とする
   * 　　- 1つでも品質（ok）が `false` の場合、`0` とする
   * 2. アイテムを30箱に分ける
   * 　　- 各箱は、全て品質（ok）が `true` の場合、`1` とする
   * 　　- 1つでも品質（ok）が `false` の場合、`0` とする
   */
  const data = useMemo(() => {
    console.log(item);
    const chunkSize60 = Math.ceil(item.length / 60);
    const chunked60 = Array.from({ length: 60 }, (_, i) =>
      item.slice(i * chunkSize60, (i + 1) * chunkSize60),
    );
    const result60 = chunked60.map((chunk) =>
      chunk.every((it) => it.ok)
        ? {
            tooltip: "All systems operational",
            color: "bg-emerald-600",
          }
        : {
            tooltip: "Some systems are experiencing issues",
            color: "bg-red-600",
          },
    );
    const chunkSize30 = Math.ceil(item.length / 30);
    const chunked30 = Array.from({ length: 30 }, (_, i) =>
      item.slice(i * chunkSize30, (i + 1) * chunkSize30),
    );
    const result30 = chunked30.map((chunk) =>
      chunk.every((it) => it.ok)
        ? {
            tooltip: "All systems operational",
            color: "bg-emerald-600",
          }
        : {
            tooltip: "Some systems are experiencing issues",
            color: "bg-red-600",
          },
    );
    console.log({ result60, result30 });
    return [...result60, ...result30];
  }, [item]);

  return (
    <>
      <Tracker className="hidden w-full sm:flex" data={data.slice(0, 60)} />
      <Tracker className="flex w-full sm:hidden" data={data.slice(0, 30)} />
    </>
  );
}
