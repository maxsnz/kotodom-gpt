import ReactJsonView from "@microlink/react-json-view";

const JsonField = ({ value }: { value: any }) => {
  return <ReactJsonView src={value} />;
};

export default JsonField;
