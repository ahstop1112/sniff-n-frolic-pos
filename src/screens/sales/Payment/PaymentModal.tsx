import Dialog from "@mui/material/Dialog"
import { usePayment } from "./hooks/usePayment"
import { MethodSelect }     from "./components/MethodSelect"
import { CashEntry }        from "./components/CashEntry"
import { ProcessingScreen } from "./components/ProcessingScreen"
import { OrderComplete }    from "./components/OrderComplete"
import type { PaymentModalProps } from "./types"

export const PaymentModal = ({
  open,
  total,
  lines,
  onClose,
  onComplete,
}: PaymentModalProps) => {
  const {
    step,
    denominations,
    received,
    change,
    canConfirmCash,
    selectMethod,
    updateDenomination,
    confirmCash,
    handleComplete,
  } = usePayment({ total, lines, onComplete })

  return (
    <Dialog
      open={open}
      onClose={step.step === "processing" ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {step.step === "select" && (
        <MethodSelect total={total} onSelect={selectMethod} />
      )}

      {step.step === "cash" && (
        <CashEntry
          total={total}
          denominations={denominations}
          received={received}
          change={change}
          canConfirm={canConfirmCash}
          onUpdate={updateDenomination}
          onConfirm={confirmCash}
          onBack={() => selectMethod("cash")}
        />
      )}

      {step.step === "processing" && <ProcessingScreen />}

      {step.step === "complete" && (
        <OrderComplete
          lines={lines}
          total={total}
          received={received}
          change={change}
          onPrint={() => console.log("🖨️ print receipt")}
          onDone={handleComplete}
        />
      )}
    </Dialog>
  )
}