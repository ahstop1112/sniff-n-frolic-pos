import { styled } from "@mui/material/styles";
import { Container, Box } from "@mui/material";

export const FullPageContainer = styled(Container)(({ theme }) => ({
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
}));

export const PageContainerWrapper = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: "3000px !important",
    minHeight: "100vh",
    display: "grid",
    placeItems: "start",
    backgroundColor: theme.palette.background.default,
    margin: 0,
    paddingLeft: `0 !important`,
    paddingRight: `0 !important`,
}));

export const Body = styled(Container)(({ theme }) => ({
    width: "100%",
    padding: theme.spacing(2),
}));