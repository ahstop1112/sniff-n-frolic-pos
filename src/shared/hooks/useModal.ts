// Modal registry — replaces 50+ boolean flags
// Single source of truth for all dialogs

import { create } from "zustand"

type ModalId = string
type ModalData = Record<string, unknown>

interface ModalState {
  activeModal: ModalId | null
  modalData: ModalData
  open: (id: ModalId, data?: ModalData) => void
  close: () => void
  isOpen: (id: ModalId) => boolean
}

export const useModal = create<ModalState>((set, get) => ({
  activeModal: null,
  modalData: {},

  open: (id, data = {}) => set({ activeModal: id, modalData: data }),
  close: () => set({ activeModal: null, modalData: {} }),
  isOpen: (id) => get().activeModal === id,
}))
