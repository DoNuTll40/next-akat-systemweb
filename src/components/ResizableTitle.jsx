// components/ResizableTitle.jsx
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

export const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;

  if (!width) return <th {...restProps} />;

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};
