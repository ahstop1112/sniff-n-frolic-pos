import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"

interface DeleteProductDialogProps {
  open: boolean
  productName: string
  onClose: () => void
  onConfirm: () => void
}

const DeleteProductDialog = ({
  open,
  productName,
  onClose,
  onConfirm,
}: DeleteProductDialogProps) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Delete product?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        <strong>{productName}</strong> will be permanently deleted. This cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
)

export default DeleteProductDialog