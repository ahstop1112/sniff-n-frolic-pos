import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import type { PaymentMethod } from "../types"

interface MethodSelectProps {
  total: number    // cents
  onSelect: (method: PaymentMethod) => void
}

const formatMoney = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100)

const METHODS = [
  {
    method: "cash" as PaymentMethod,
    label: "Cash",
    icon: <AttachMoneyIcon sx={{ fontSize: 32 }} />,
  },
  {
    method: "credit" as PaymentMethod,
    label: "Credit Card",
    icon: <CreditCardIcon sx={{ fontSize: 32 }} />,
  },
  {
    method: "debit" as PaymentMethod,
    label: "Debit Card",
    icon: <AccountBalanceIcon sx={{ fontSize: 32 }} />,
  },
]

export const MethodSelect = ({ total, onSelect }: MethodSelectProps) => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" fontWeight={800} textAlign="center" mb={1}>
      Select Payment Method
    </Typography>
    <Typography variant="h4" fontWeight={900} textAlign="center" color="primary" mb={4}>
      {formatMoney(total)}
    </Typography>

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {METHODS.map(({ method, label, icon }) => (
        <Button
          key={method}
          variant="outlined"
          size="large"
          onClick={() => onSelect(method)}
          startIcon={icon}
          sx={{
            py: 2,
            justifyContent: "flex-start",
            borderRadius: 3,
            fontSize: 16,
            fontWeight: 700,
            textTransform: "none",
            borderWidth: 1.5,
          }}
        >
          {label}
        </Button>
      ))}
    </Box>
  </Box>
)