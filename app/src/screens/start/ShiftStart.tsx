import { useMemo, useState } from "react";
import { MenuItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/domains/auth/store";
import { useSessionStore } from "@/domains/session/store";
import {
    ShiftCard,
    Title,
    Sub,
    Row,
    FullRow,
    Actions,
    PrimaryButton,
    SecondaryButton,
    Field, FieldLabel,
    BranchControl, BranchSelect
} from "./styles";
import { FullPageContainer } from "@/screens/layout/PageContainer/styles";

const ShiftStartScreen = () => {
  const navigate = useNavigate();

  const staffName = useAuthStore((s) => s.user?.name ?? "Staff");
  const staffRole = useAuthStore((s) => s.user?.role ?? "");

  const branches = useSessionStore((s) => s.branches);
  const branchId = useSessionStore((s) => s.branchId);
  const deviceName = useSessionStore((s) => s.deviceName);
  const drawerId = useSessionStore((s) => s.drawerId);

  const setBranchId = useSessionStore((s) => s.setBranchId);
  const setDeviceName = useSessionStore((s) => s.setDeviceName);
  const setDrawerId = useSessionStore((s) => s.setDrawerId);
  const startShift = useSessionStore((s) => s.startShift);

  const [touched, setTouched] = useState(false);

  const branchLabel = useMemo(() => {
    if (!branchId) return "";
    return branches.find((b) => b.id === branchId)?.label ?? "";
  }, [branchId, branches]);

  const canStart = Boolean(branchId);

  const handleStart = () => {
    setTouched(true);
    if (!canStart) return;

    startShift();
    navigate("/pos/home", { replace: true });
  };

  return (
    <FullPageContainer>
      <ShiftCard elevation={6}>
        <Title variant="h5">Start shift</Title>
        <Sub variant="body2">
          Hi <b>{staffName}</b> ({staffRole ? `${staffRole}` : ""}), Please choose your branch and device.
        </Sub>

        <FullRow>
          <BranchControl fullWidth size="small">
            <BranchSelect
              value={branchId ?? ""}
              displayEmpty
              onChange={(e: any) => setBranchId(String(e.target.value))}
            >
              <MenuItem value="" disabled>
                Select branch…
              </MenuItem>
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.label}
                </MenuItem>
              ))}
            </BranchSelect>

            {touched && !branchId ? (
              <Typography variant="caption" color="error">
                Please select a branch.
              </Typography>
            ) : null}
          </BranchControl>
        </FullRow>

        {/* <FullRow>
          <FieldLabel variant="caption">Device name (optional)</FieldLabel>
          <Field
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. iPad Front Desk"
              fullWidth
          />
        </FullRow>

        <FullRow>
          <FieldLabel variant="caption">Cash drawer (optional)</FieldLabel>
          <Field
          value={drawerId}
          onChange={(e) => setDrawerId(e.target.value)}
          placeholder="e.g. Drawer A"
          fullWidth
          />
        </FullRow> */}

        <Actions>
          <PrimaryButton
            variant="contained"
            size="large"
            disabled={!canStart}
            onClick={handleStart}
          >
            Start shift
          </PrimaryButton>

          <SecondaryButton
            variant="outlined"
            size="large"
            onClick={() => navigate("/login", { replace: true })}
          >
            Cancel
          </SecondaryButton>
        </Actions>

        {branchLabel ? (
          <Typography variant="caption" color="text.secondary" display="block" marginTop={2}>
            You’ll be operating under: {branchLabel}
          </Typography>
        ) : null}
      </ShiftCard>
    </FullPageContainer>
  );
};

export default ShiftStartScreen;