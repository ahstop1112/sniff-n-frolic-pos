import { useMemo, useState } from "react";
import {
    Stack,
  Avatar,
  Badge,
  Box,
  Menu,
  MenuItem,
  ToggleButton,
  Typography,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PetsIcon from "@mui/icons-material/Pets";
import type { AppMode } from "@/app/types";
import type { HeaderProps } from "./types";
import {
    Root,
    Left,
    Right,
    BranchRow,
    BranchName,
    StatusDot,
    HeaderIconButton,
    ModeSwitch,
    StaffButton,
} from "./styles";

const formatBadge = (n: number) => (n > 99 ? "99+" : String(n));

const Header = ({
  branchName = "Vancouver",
  networkStatus = "online",
  onlineOrderCount,
  mode,
  onModeChange,
  staff,
  onCashIn,
  onCashOut,
  onLogout,
  onOpenOnlineOrders,
}: HeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const initials = useMemo(() => {
    const parts = (staff?.name || `perry`).trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }, [staff?.name]);

  const handleMode = (_: unknown, next: AppMode | null) => {
    if (!next || next === mode) return;
    // onModeChange(next);
  };

  return (
    <Root>
        <Left>
            <PetsIcon sx={{ color: "primary.main", fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: 1 }}>
                Zoomies
            </Typography>
            <BranchRow>
                <BranchName>{branchName}</BranchName>
                <StatusDot status={networkStatus} title={networkStatus} aria-label={`Network: ${networkStatus}`} />
            </BranchRow>
        </Left>

      <Right>
        <HeaderIconButton onClick={onOpenOnlineOrders} aria-label="Online orders">
          <Badge badgeContent={onlineOrderCount > 0 ? formatBadge(onlineOrderCount) : null}>
            <NotificationsNoneIcon />
          </Badge>
        </HeaderIconButton>

        <ModeSwitch value={mode} exclusive onChange={handleMode} aria-label="Mode switch">
          <ToggleButton value="sales">Sales</ToggleButton>
          <ToggleButton value="manage">Manage</ToggleButton>
        </ModeSwitch>

        <Box>
          <StaffButton
            role="button"
            tabIndex={0}
            onClick={(e) => setAnchorEl(e.currentTarget as unknown as HTMLElement)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title={staff?.name}
          >
            <Avatar sx={{ width: 28, height: 28, bgcolor: "action.hover", color: "text.primary" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 900 }}>{initials}</Typography>
            </Avatar>
            <KeyboardArrowDownIcon fontSize="small" />
          </StaffButton>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography sx={{ fontWeight: 900, fontSize: 13 }}>{staff?.name}</Typography>
            </Box>

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                // onCashIn();
              }}
            >
              Cash In
            </MenuItem>

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                // onCashOut();
              }}
            >
              Cash Out
            </MenuItem>

            <Box sx={{ my: 0.5, borderTop: 1, borderColor: "divider" }} />

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                // onLogout();
              }}
              sx={{ color: "error.main", fontWeight: 800 }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Right>
    </Root>
  );
};

export default Header;