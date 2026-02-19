import type { PropsWithChildren } from "react";
import Header from "../Header";
import { PageContainerWrapper, Body } from "./styles";

const PageContainer = ({ children }: PropsWithChildren) => {
  return (
    <PageContainerWrapper maxWidth={false}>
      <Header />
      <Body>{children}</Body>
    </PageContainerWrapper>
  );
};

export default PageContainer;