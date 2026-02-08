import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RiCloseLine } from "@remixicon/react";
import { useIntlayer } from "react-intlayer";
import { MarkdownComponents } from "./markdown/components";

export const CookieNotice = () => {
  const t = useIntlayer("cookie-notice");

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          id="cookie-notice"
          initial={{ y: 100, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: 100, opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "linear" }}
          className="fixed flex items-center bottom-0 left-0 right-0 bg-primary text-primary-foreground p-5"
        >
          <div className="inline-flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg hover:bg-muted/20 active:bg-muted/10 active:scale-95 transition-all duration-150 ease-linear"
            >
              <RiCloseLine />
            </button>
            <span>
              {t.msg.use({
                a: ({ children }) => (
                  <MarkdownComponents.a
                    href="/policies/cookie"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </MarkdownComponents.a>
                ),
              })}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
