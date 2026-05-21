import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import { type useCategoryManager } from "../hooks/useCategoryManager"

interface CategoryDialogProps {
  manager: ReturnType<typeof useCategoryManager>
}

const CategoryDialog = ({ manager }: CategoryDialogProps) => (
  <Dialog open={manager.dialogMode !== null} onClose={manager.closeDialog} maxWidth="xs" fullWidth>
    <DialogTitle>
      {manager.dialogMode === "create" ? "New Category" : "Edit Category"}
    </DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        label="Category Name"
        value={manager.nameInput}
        onChange={(e) => manager.setNameInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && manager.handleSave()}
        fullWidth
        sx={{ mt: 1 }}
        error={!!manager.error}
        helperText={manager.error?.message}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={manager.closeDialog}>Cancel</Button>
      <Button
        onClick={manager.handleSave}
        variant="contained"
        disabled={manager.isSaving || !manager.nameInput.trim()}
      >
        {manager.isSaving ? "Saving…" : "Save"}
      </Button>
    </DialogActions>
  </Dialog>
)

export default CategoryDialog