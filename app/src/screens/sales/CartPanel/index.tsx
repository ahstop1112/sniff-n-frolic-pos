import { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { useOrders } from "@/domains/orders";
import type { CartPanelProps } from "./types";
import {
  Root,
  TabsRow,
  LinesArea,
  LineRow,
  LineLeft,
  LineRight,
  SummaryBar,
  SummaryRow,
  ActionsRow,
} from "./styles";
const formatMoney = (value: number, currency: "CAD" | "HKD" | "USD") => {
  // MVP: keep simple. You can swap to Intl.NumberFormat later with locale
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

export const CartPanel = ({ currency = "CAD", onPay }: CartPanelProps) => {
  const orders = useOrders((s) => s.orders);
  const activeOrderId = useOrders((s) => s.activeOrderId);

  const setActiveOrder = useOrders((s) => s.setActiveOrder);
  const createOrder = useOrders((s) => s.createOrder);
  const closeOrder = useOrders((s) => s.closeOrder);
  const clearOrder = useOrders((s) => s.clearOrder);

  const incLineQty = useOrders((s) => s.incLineQty);
  const decLineQty = useOrders((s) => s.decLineQty);
  const removeLine = useOrders((s) => s.removeLine);

  const getOrderSubtotal = useOrders((s) => s.getOrderSubtotal);
  const getOrderTax = useOrders((s) => s.getOrderTax);
  const getOrderTotal = useOrders((s) => s.getOrderTotal);

  const activeOrder = useMemo(
    () => orders.find((o) => o.id === activeOrderId),
    [orders, activeOrderId]
  );

  const subtotal = useMemo(
    () => (activeOrder ? getOrderSubtotal(activeOrder.id) : 0),
    [activeOrder, getOrderSubtotal]
  );
  const tax = useMemo(
    () => (activeOrder ? getOrderTax(activeOrder.id) : 0),
    [activeOrder, getOrderTax]
  );
  const total = useMemo(
    () => (activeOrder ? getOrderTotal(activeOrder.id) : 0),
    [activeOrder, getOrderTotal]
  );

  const handleAddOrder = () => {
    createOrder();
  };

  const handleCloseOrder = (orderId: string) => {
    closeOrder(orderId);
  };

  const handlePay = () => {
    if (!activeOrder) return;
    onPay?.(activeOrder.id);
  };

  if (!activeOrder) {
    return (
      <Root>
        <TabsRow>
          <Typography variant="subtitle1">Cart</Typography>
        </TabsRow>
        <LinesArea>
          <Typography variant="body2" color="text.secondary">
            No active order.
          </Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={handleAddOrder}>
            Create Order
          </Button>
        </LinesArea>
      </Root>
    );
  }

  return (
    <Root>
      <TabsRow>
        <Tabs
          value={activeOrderId}
          onChange={(_, v) => setActiveOrder(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {orders.map((o) => (
            <Tab
              key={o.id}
              value={o.id}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" noWrap>
                    {o.label}
                  </Typography>

                  <IconButton
                    size="small"
                    aria-label="close order"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseOrder(o.id);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            />
          ))}
        </Tabs>

        <IconButton aria-label="new order" onClick={handleAddOrder}>
          <AddIcon />
        </IconButton>
      </TabsRow>

      <LinesArea>
        {activeOrder.lines.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Cart is empty. Tap a product to add.
          </Typography>
        ) : (
          activeOrder.lines.map((l) => (
            <LineRow key={l.id}>
              <LineLeft>
                <Typography variant="subtitle2" noWrap>
                  {l.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatMoney(l.unitPrice, currency)} × {l.qty}
                </Typography>
              </LineLeft>

              <LineRight>
                <IconButton
                  aria-label="decrease qty"
                  size="small"
                  onClick={() => decLineQty(activeOrder.id, l.id)}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <Typography variant="subtitle2">{l.qty}</Typography>

                <IconButton
                  aria-label="increase qty"
                  size="small"
                  onClick={() => incLineQty(activeOrder.id, l.id)}
                >
                  <AddCircleOutlineIcon fontSize="small" />
                </IconButton>

                <Divider orientation="vertical" flexItem />

                <IconButton
                  aria-label="remove line"
                  size="small"
                  onClick={() => removeLine(activeOrder.id, l.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </LineRight>
            </LineRow>
          ))
        )}
      </LinesArea>

      <SummaryBar>
        <SummaryRow>
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body2">{formatMoney(subtotal, currency)}</Typography>
        </SummaryRow>

        <SummaryRow>
          <Typography variant="body2" color="text.secondary">
            Tax
          </Typography>
          <Typography variant="body2">{formatMoney(tax, currency)}</Typography>
        </SummaryRow>

        <Divider />

        <SummaryRow>
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="subtitle1">{formatMoney(total, currency)}</Typography>
        </SummaryRow>

        <ActionsRow>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => clearOrder(activeOrder.id)}
            disabled={activeOrder.lines.length === 0}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={handlePay}
            disabled={activeOrder.lines.length === 0}
          >
            Pay
          </Button>
        </ActionsRow>
      </SummaryBar>
    </Root>
  );
};

export default CartPanel;