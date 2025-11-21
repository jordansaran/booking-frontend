import * as React from "react"
import { AlertTriangle, CheckCircle, Trash2, Edit, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"
import { cn } from "@/lib/utils"

type DialogType = "confirm" | "delete" | "edit" | "warning"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  type?: DialogType
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

const dialogConfig: Record<DialogType, { icon: React.ReactNode; confirmVariant: "default" | "destructive" }> = {
  confirm: {
    icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    confirmVariant: "default"
  },
  delete: {
    icon: <Trash2 className="h-6 w-6 text-red-600" />,
    confirmVariant: "destructive"
  },
  edit: {
    icon: <Edit className="h-6 w-6 text-blue-600" />,
    confirmVariant: "default"
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
    confirmVariant: "default"
  }
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  type = "confirm",
  confirmText,
  cancelText = "Cancelar",
  onConfirm,
  loading = false
}: ConfirmDialogProps) {
  const config = dialogConfig[type]

  const defaultConfirmText = {
    confirm: "Confirmar",
    delete: "Excluir",
    edit: "Salvar",
    warning: "Continuar"
  }

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    await onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {config.icon}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              config.confirmVariant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Aguarde...
              </>
            ) : (
              confirmText || defaultConfirmText[type]
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { type DialogType }
