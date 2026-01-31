import { useEffect, useState } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

type ThemeMode = "light" | "dark" | "system";

const getThemeMode = (): ThemeMode => {
  if (typeof document === "undefined") {
    return "system";
  }

  const root = document.documentElement;

  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";

  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
};

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    const updateTheme = () => setTheme(getThemeMode());
    updateTheme();

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleMediaChange = () => updateTheme();

    if (media?.addEventListener) {
      media.addEventListener("change", handleMediaChange);
    } else if (media?.addListener) {
      media.addListener(handleMediaChange);
    }

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      if (media?.removeEventListener) {
        media.removeEventListener("change", handleMediaChange);
      } else if (media?.removeListener) {
        media.removeListener(handleMediaChange);
      }
    };
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
