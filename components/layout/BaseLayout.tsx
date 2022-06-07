import { FunctionComponent } from "react";
import Props from "../../interfaces/Props";

const BaseLayout: FunctionComponent<Props> = ({children}) => {
  return <div>
    {children}
  </div>;
};

export default BaseLayout;
