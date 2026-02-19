import { styled } from "@mui/material/styles";
import { Box, Paper } from "@mui/material";

export const Page = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
}));

export const Card = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2.5),
  },
}));
