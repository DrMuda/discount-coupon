import { type LoaderFunctionArgs } from '@remix-run/node';

export function loader({ request, params }: LoaderFunctionArgs) {
  const { id } = params;
  if(id==="global"){
    console.log("global")
  }else{
    console.log(id)
  }
  return "params"
}

export default function Setting() {
  return (
    <div className="p-2">
      <div className="bg-white rounded-lg p-3">设置页面</div>
    </div>
  );
}
