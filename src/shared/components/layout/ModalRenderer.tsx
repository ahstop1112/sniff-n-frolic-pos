// Renders the active modal — replaces 50 inline <DialogInput> components
// Add new modals here as you build them

import { useModal } from "../../hooks/useModal"

// TODO: import actual modal components as you build them
// import { PaymentModal } from "@/domains/checkout/components/PaymentPanel"
// import { CashInModal }   from "@/domains/staff/components/CashDrawerPanel"

export const ModalRenderer = () => {
  const { activeModal } = useModal()

  switch (activeModal) {
    // case "payment":   return <PaymentModal />
    // case "cash-in":   return <CashInModal />
    default:
      return null
  }
}
