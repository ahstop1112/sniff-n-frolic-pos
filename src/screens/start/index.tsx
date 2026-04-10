import { useSessionStore } from "@/domains/session/store";
import HomeScreen from "./Home";
import ShiftStartScreen from "./ShiftStart";


const StartScreen = () => {
    const shiftStatus = useSessionStore((s) => s.shiftStatus);

    if (shiftStatus !== "active") {
        return <ShiftStartScreen />;
    }

    return <HomeScreen />;
};

export default StartScreen;