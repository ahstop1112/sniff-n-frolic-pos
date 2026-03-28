import type { PropsWithChildren } from "react";
import Header from "../Header";
import { PageContainerWrapper, Body } from "./styles";

const FullPageContainerWithHeader = ({ children }: PropsWithChildren) => {
  return (
    <PageContainerWrapper>
      <Header />
      {children}
    </PageContainerWrapper>
  );
};

export default FullPageContainerWithHeader;