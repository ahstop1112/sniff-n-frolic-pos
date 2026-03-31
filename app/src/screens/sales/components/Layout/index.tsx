import { useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";

import type { SalesLayoutProps } from "./types";
import {
  Root,
  HeaderArea,
  Main,
  Panel,
  PanelHeader,
  PanelBody,
  MobileSwitchBar,
} from "./styles";

type MobileView = "products" | "cart";

const SalesLayout = ({ slots, className }: SalesLayoutProps) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [mobileView, setMobileView] = useState<MobileView>("products");

  const productNode = useMemo(
    () =>
      slots?.product ?? (
        <Typography variant="body2" color="text.secondary">
          Product browser slot
        </Typography>
      ),
    [slots?.product]
  );

  const cartNode = useMemo(
    () =>
      slots?.cart ?? (
        <Typography variant="body2" color="text.secondary">
          Cart slot
        </Typography>
      ),
    [slots?.cart]
  );

  const handleMobileViewChange = (_: unknown, next: MobileView | null) => {
    if (!next) return;
    setMobileView(next);
  };

  return (
    <Root className={className}>
      <Main>
        {!isMdUp && (
          <Panel>
            <MobileSwitchBar>
              <ToggleButtonGroup
                value={mobileView}
                exclusive
                onChange={handleMobileViewChange}
                size="small"
                fullWidth
              >
                <ToggleButton value="products">Products</ToggleButton>
                <ToggleButton value="cart">Cart</ToggleButton>
              </ToggleButtonGroup>
            </MobileSwitchBar>

            <PanelBody>{mobileView === "products" ? productNode : cartNode}</PanelBody>
          </Panel>
        )}

        {isMdUp && (
          <>
            <Panel>
              <PanelHeader>
                <Typography variant="subtitle1">Products</Typography>
              </PanelHeader>
              <PanelBody>{productNode}</PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <Typography variant="subtitle1">Cart</Typography>
              </PanelHeader>
              <PanelBody>{cartNode}</PanelBody>
            </Panel>
          </>
        )}
      </Main>
    </Root>
  );
};

export default SalesLayout;