import Example from "@/components/common/demo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {

  return (
    <div className="min-h-screen">
      <section className="py-20 max-w-3xl mx-auto">
        <Example />
      </section>
    </div>
  );
}
