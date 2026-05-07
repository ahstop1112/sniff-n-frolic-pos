import { useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Box from "@mui/material/Box"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
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

        {/* Orders breakdown */}
        <div className={styles.popupBody}>
          {(data?.orders ?? [])
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((order) => (
            <Accordion key={order.id} disableGutters elevation={0}
              sx={{ border: 1, borderColor: "divider", mb: 1, borderRadius: "8px !important",
                "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", pr: 1 }}>
                <Box>
                    <Typography variant="body2" fontWeight={700}>{order.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleTimeString("en-US", { 
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true 
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {order.itemCount} items
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="primary">
                      {formatMoney(order.total)}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {order.items.map((item, i) => (
                  <div key={i} className={styles.popupRow}>
                    <div>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">× {item.qty}</Typography>
                    </div>
                    <Typography variant="body2" fontWeight={600}>
                      {formatMoney(item.total)}
                    </Typography>
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>

        {/* Grand total */}
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