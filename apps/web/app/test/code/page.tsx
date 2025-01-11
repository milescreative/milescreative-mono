const component = () => {
  return <div>Hello</div>;
};

const code = component.toString();

export default function CodePage() {
  return <div>{code}</div>;
}
