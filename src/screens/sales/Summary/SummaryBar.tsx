import { useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Box from "@mui/material/Box"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import { useDailySummary } from "../hooks/useDailySummary"
import styles from "./SummaryBar.module.scss"

const formatMoney = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(cents / 100)

const SalesSummaryBar = () => {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useDailySummary()

  return (
    <>
      <div className={styles.root}>

        {/* Revenue */}
        <div className={styles.stat}>
          <TrendingUpIcon sx={{ fontSize: 16, color: "success.main" }} />
          <span className={styles.statLabel}>Today</span>
          {isLoading
            ? <Skeleton width={64} height={18} />
            : <span className={styles.statValue}>{formatMoney(data?.totalRevenue ?? 0)}</span>
          }
        </div>

        <div className={styles.divider} />

        {/* Orders */}
        <div className={styles.stat}>
          <ShoppingBagOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          {isLoading
            ? <Skeleton width={40} height={18} />
            : <span className={styles.statValue}>{data?.orderCount ?? 0}</span>
          }
          <span className={styles.statLabel}>orders</span>
        </div>

        <div className={styles.divider} />

        {/* Items */}
        <div className={styles.stat}>
          <Inventory2OutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          {isLoading
            ? <Skeleton width={40} height={18} />
            : <span className={styles.statValue}>{data?.itemCount ?? 0}</span>
          }
          <span className={styles.statLabel}>items</span>
        </div>

        {/* Detail button */}
        <Button
          size="small"
          variant="outlined"
          className={styles.detailButton}
          onClick={() => setOpen(true)}
        >
          View breakdown
        </Button>

      </div>

      {/* Popup */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ className: styles.popupPaper }}
      >
        <DialogTitle className={styles.popupHeader}>
          <Typography variant="subtitle1" fontWeight={700}>
            Today's breakdown
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data?.orderCount ?? 0} orders · {data?.itemCount ?? 0} items
          </Typography>
        </DialogTitle>

        <div className={styles.popupBody}>
          {(data?.topItems ?? []).map((item) => (
            <div key={item.name} className={styles.popupRow}>
              <div>
                <Typography variant="body2" fontWeight={500}>
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  × {item.qty}
                </Typography>
              </div>
              <Typography variant="body2" fontWeight={700}>
                {formatMoney(item.total)}
              </Typography>
            </div>
          ))}
        </div>

        <div className={styles.popupTotal}>
          <Typography variant="subtitle2" fontWeight={700}>Total</Typography>
          <Typography variant="subtitle1" fontWeight={800} color="primary">
            {formatMoney(data?.totalRevenue ?? 0)}
          </Typography>
        </div>

      </Dialog>
    </>
  )
}

export default SalesSummaryBar