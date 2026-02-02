import { InfoHeader } from "./info-header";
import { Monitors } from "./monitors";

export function StatusPageLayoutContainer() {
  return (
    <div className="max-w-3xl py-20 mx-auto">
      <InfoHeader />
      <Monitors />
    </div>
  );
}
