import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon, SpinnerIcon } from "@phosphor-icons/react"
import { useSyncExternalStore } from "react"

const getTheme = () => {
  if (typeof document === "undefined") return "light"
  const root = document.documentElement
  return root.classList.contains("dark") ? "dark" : "light"
}

const subscribe = (callback: () => void) => {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === "class") {
        callback()
        return
      }
    }
  })
  observer.observe(document.documentElement, { attributes: true })
  return () => observer.disconnect()
}

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light")

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircleIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <WarningIcon className="size-4" />
        ),
        error: (
          <XCircleIcon className="size-4" />
        ),
        loading: (
          <SpinnerIcon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
