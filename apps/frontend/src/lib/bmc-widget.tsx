import { useEffect } from "react";
import { toast } from "sonner";
import { LocalizedLink } from "@/components/LocalizedLink";

export default function BMCWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    const div = document.getElementById("supportByBMC");
    script.setAttribute("data-name", "BMC-Widget");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-id", "toakiryu");
    script.setAttribute("data-description", "Support me on Buy me a matcha!");
    script.setAttribute("data-message", "");
    script.setAttribute("data-color", "#FFDD00");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      var evt = document.createEvent("Event");
      evt.initEvent("DOMContentLoaded", false, false);
      window.dispatchEvent(evt);
    };
    div?.appendChild(script);

    toast.info(
      <>
        運用には皆様のご支援が必要です。支援していただけると嬉しいです！
        <LocalizedLink to="/funding" className="underline">
          詳細はこちら
        </LocalizedLink>
      </>
    );
  }, []);

  return <div id="supportByBMC"></div>;
}
