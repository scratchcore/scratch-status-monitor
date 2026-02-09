/**
 * ユーザーの利用している言語のコンテンツが存在しないため、defaultを使っている場合のお知らせコンポーネント
 */

import { RiInformationLine } from "@remixicon/react";
import { Alert, AlertDescription } from "../ui/alert";

export function IsDefaultNotice() {
  return (
    <Alert>
      <RiInformationLine />
      <AlertDescription>
        You are viewing the default language content because your preferred language is not
        available.
      </AlertDescription>
    </Alert>
  );
}
